import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadBookDto } from './dto/upload-book.dto';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  upload(@Body() dto: UploadBookDto) {
    return this.booksService.uploadBook(dto);
  }

  @Get()
  list() {
    return this.booksService.listBooks();
  }

  @Get('search')
  search(@Query('q') q = '') {
    return this.booksService.search(q);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }
}
