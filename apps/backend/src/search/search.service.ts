import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { Book } from '../entities/book.entity';

type BookSearchResult = {
  id: string;
  title: string;
  plainTextContent: string;
};

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly client: Client;
  private readonly index: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.getOrThrow<string>('ELASTICSEARCH_NODE'),
    });
    this.index = this.configService.get<string>('ELASTICSEARCH_INDEX', 'books');
  }

  async ensureIndex() {
    const exists = await this.client.indices.exists({ index: this.index });
    if (exists) {
      return;
    }

    await this.client.indices.create({
      index: this.index,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          title: { type: 'text' },
          plainTextContent: { type: 'text' },
          htmlContent: { type: 'text' },
        },
      },
    });

    this.logger.log(`Created Elasticsearch index: ${this.index}`);
  }

  async indexBook(book: Book) {
    await this.ensureIndex();
    await this.client.index({
      index: this.index,
      id: book.id,
      document: {
        id: book.id,
        title: book.title,
        plainTextContent: book.plainTextContent ?? '',
        htmlContent: book.htmlContent ?? '',
      },
      refresh: 'wait_for',
    });
  }

  async searchBooks(query: string): Promise<BookSearchResult[]> {
    await this.ensureIndex();
    const response = await this.client.search<BookSearchResult>({
      index: this.index,
      query: {
        multi_match: {
          query,
          fields: ['title^2', 'plainTextContent', 'htmlContent'],
          fuzziness: 'AUTO',
        },
      },
      size: 20,
    });

    return response.hits.hits
      .map((hit) => hit._source)
      .filter((hit): hit is BookSearchResult => Boolean(hit));
  }
}
