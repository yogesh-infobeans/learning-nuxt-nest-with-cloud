import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CacheService } from '../cache/cache.service';
import { Book, BookStatus } from '../entities/book.entity';
import { XmlParserService } from '../parsing/xml-parser.service';
import { RabbitmqService } from '../queue/rabbitmq.service';
import { SearchService } from '../search/search.service';
import { BooksService } from './books.service';

describe('BooksService', () => {
  let service: BooksService;
  let booksRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };
  let rabbitmqService: { publish: jest.Mock };
  let parserService: { parseBookXml: jest.Mock };
  let searchService: { searchBooks: jest.Mock; indexBook: jest.Mock };
  let cacheService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(() => {
    booksRepository = {
      create: jest.fn((payload) => payload as Book),
      save: jest.fn(async (book) => ({
        ...book,
        id: book.id ?? 'book-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    rabbitmqService = {
      publish: jest.fn(),
    };

    parserService = {
      parseBookXml: jest.fn(),
    };

    searchService = {
      searchBooks: jest.fn(),
      indexBook: jest.fn(),
    };

    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    service = new BooksService(
      booksRepository as unknown as Repository<Book>,
      rabbitmqService as unknown as RabbitmqService,
      parserService as unknown as XmlParserService,
      searchService as unknown as SearchService,
      cacheService as unknown as CacheService,
    );
  });

  it('queues uploaded books for background processing', async () => {
    booksRepository.save.mockImplementation(async (book) => ({
      ...(book as Book),
      id: 'book-1',
    }));

    const result = await service.uploadBook({
      title: 'Sample Book',
      xmlContent: '<book><title>Sample Book</title></book>',
    });

    expect(result.status).toBe(BookStatus.QUEUED);
    expect(rabbitmqService.publish).toHaveBeenCalledWith({ bookId: 'book-1' });
  });

  it('returns cached book when available', async () => {
    const cachedBook = {
      id: 'book-1',
      title: 'Cached Book',
      status: BookStatus.READY,
    } as Book;
    cacheService.get.mockResolvedValue(cachedBook);

    await expect(service.getBookById('book-1')).resolves.toEqual(cachedBook);
    expect(booksRepository.findOne).not.toHaveBeenCalled();
  });

  it('loads book from database and stores it in cache', async () => {
    cacheService.get.mockResolvedValue(null);
    booksRepository.findOne.mockResolvedValue({
      id: 'book-1',
      title: 'Database Book',
      status: BookStatus.READY,
    } as Book);

    const result = await service.getBookById('book-1');

    expect(result.title).toBe('Database Book');
    expect(cacheService.set).toHaveBeenCalledWith('book:book-1', expect.any(Object));
  });

  it('throws when book is not found', async () => {
    cacheService.get.mockResolvedValue(null);
    booksRepository.findOne.mockResolvedValue(null);

    await expect(service.getBookById('missing-book')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('prefers elasticsearch results for search', async () => {
    searchService.searchBooks.mockResolvedValue([
      {
        id: 'book-1',
        title: 'Elastic Result',
        plainTextContent: 'content',
      },
    ]);

    const results = await service.search('elastic');

    expect(results).toHaveLength(1);
    expect(booksRepository.find).not.toHaveBeenCalled();
  });

  it('processes queued book and indexes parsed content', async () => {
    booksRepository.findOne.mockResolvedValue({
      id: 'book-1',
      title: 'Queued Book',
      rawXml: '<book><title>Queued Book</title></book>',
      status: BookStatus.QUEUED,
    } as Book);
    parserService.parseBookXml.mockResolvedValue({
      htmlContent: '<article><h1>Queued Book</h1></article>',
      plainTextContent: 'Queued Book',
    });

    await service.processBookUpload('book-1');

    expect(parserService.parseBookXml).toHaveBeenCalled();
    expect(searchService.indexBook).toHaveBeenCalledWith(
      expect.objectContaining({
        status: BookStatus.READY,
        htmlContent: '<article><h1>Queued Book</h1></article>',
      }),
    );
    expect(cacheService.del).toHaveBeenCalledWith('book:book-1');
  });

});
