import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../queue/rabbitmq.service';
import { BooksService } from './books.service';

@Injectable()
export class BooksProcessor implements OnModuleInit {
  private readonly logger = new Logger(BooksProcessor.name);

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly booksService: BooksService,
  ) {}

  async onModuleInit() {
    await this.rabbitmqService.consume(async (payload) => {
      const bookId = this.extractBookId(payload);
      if (!bookId) {
        this.logger.warn('Skipping invalid queue payload');
        return;
      }

      await this.booksService.processBookUpload(bookId);
    });
  }

  private extractBookId(payload: unknown): string | null {
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }
    const candidate = (payload as Record<string, unknown>).bookId;
    return typeof candidate === 'string' ? candidate : null;
  }
}
