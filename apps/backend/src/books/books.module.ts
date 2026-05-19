import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../entities/book.entity';
import { ParsingModule } from '../parsing/parsing.module';
import { BooksController } from './books.controller';
import { BooksProcessor } from './books.processor';
import { BooksService } from './books.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book]), ParsingModule],
  providers: [BooksService, BooksProcessor],
  controllers: [BooksController],
})
export class BooksModule {}
