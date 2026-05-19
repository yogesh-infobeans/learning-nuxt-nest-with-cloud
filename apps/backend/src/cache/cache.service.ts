import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.getOrThrow<string>('REDIS_URL'));
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number) {
    const fallbackTtl = this.configService.get<number>('CACHE_TTL_SECONDS', 120);
    const ttl = ttlSeconds ?? fallbackTtl;
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
