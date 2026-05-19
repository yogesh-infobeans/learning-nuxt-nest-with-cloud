import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { validateEnv } from './config/env.validation';
import { Book } from './entities/book.entity';
import { User } from './entities/user.entity';
import { QueueModule } from './queue/queue.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        entities: [Book, User],
        synchronize: true,
      }),
    }),
    QueueModule,
    CacheModule,
    SearchModule,
    AuthModule,
    BooksModule,
  ],
})
export class AppModule {}
