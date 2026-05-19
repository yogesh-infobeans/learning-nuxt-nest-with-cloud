import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { Book, BookStatus } from '../entities/book.entity';
import { XmlParserService } from '../parsing/xml-parser.service';
import { RabbitmqService } from '../queue/rabbitmq.service';
import { SearchService } from '../search/search.service';
import { UploadBookDto } from './dto/upload-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
    private readonly rabbitmqService: RabbitmqService,
    private readonly parserService: XmlParserService,
    private readonly searchService: SearchService,
    private readonly cacheService: CacheService,
  ) {}

  async uploadBook(dto: UploadBookDto) {
    const book = this.booksRepository.create({
      title: dto.title,
      rawXml: dto.xmlContent,
      status: BookStatus.QUEUED,
    });
    const saved = await this.booksRepository.save(book);
    await this.rabbitmqService.publish({ bookId: saved.id });
    return saved;
  }

  async listBooks() {
    return this.booksRepository.find({
      order: { createdAt: 'DESC' },
      select: ['id', 'title', 'status', 'createdAt', 'updatedAt'],
    });
  }

  async getBookById(id: string) {
    const cacheKey = this.getBookCacheKey(id);
    const cached = await this.cacheService.get<Book>(cacheKey);
    if (cached) {
      return cached;
    }

    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }

    await this.cacheService.set(cacheKey, book);
    return book;
  }

  async search(query: string) {
    const results = await this.searchService.searchBooks(query);
    if (results.length > 0) {
      return results;
    }

    return this.booksRepository.find({
      where: [{ title: ILike(`%${query}%`) }, { plainTextContent: ILike(`%${query}%`) }],
      select: ['id', 'title', 'plainTextContent'],
      take: 20,
    });
  }

  async processBookUpload(bookId: string) {
    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book ${bookId} not found`);
    }

    book.status = BookStatus.PROCESSING;
    await this.booksRepository.save(book);

    try {
      const parsed = await this.parserService.parseBookXml(book.rawXml);
      book.htmlContent = parsed.htmlContent;
      book.plainTextContent = parsed.plainTextContent;
      book.status = BookStatus.READY;
      book.failureReason = null;
      const savedBook = await this.booksRepository.save(book);
      await this.searchService.indexBook(savedBook);
      await this.cacheService.del(this.getBookCacheKey(savedBook.id));
    } catch (error) {
      book.status = BookStatus.FAILED;
      book.failureReason = (error as Error).message;
      await this.booksRepository.save(book);
      throw error;
    }
  }

  private getBookCacheKey(bookId: string): string {
    return `book:${bookId}`;
  }
}
