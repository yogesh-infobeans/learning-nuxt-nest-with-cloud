import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvVariables {
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 4000;

  @IsString()
  DB_HOST = 'localhost';

  @IsInt()
  DB_PORT = 5432;

  @IsString()
  DB_USERNAME = 'books';

  @IsString()
  DB_PASSWORD = 'books';

  @IsString()
  DB_NAME = 'books_db';

  @IsString()
  ELASTICSEARCH_NODE = 'http://localhost:9200';

  @IsString()
  ELASTICSEARCH_INDEX = 'books';

  @IsString()
  RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';

  @IsString()
  RABBITMQ_QUEUE = 'book_upload_queue';

  @IsString()
  REDIS_URL = 'redis://localhost:6379';

  @IsOptional()
  @IsInt()
  CACHE_TTL_SECONDS = 120;

  @IsString()
  JWT_SECRET = 'dev-jwt-secret-change-me';

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN = '1d';
}

const INTEGER_ENV_KEYS = ['PORT', 'DB_PORT', 'CACHE_TTL_SECONDS'] as const;

function coerceIntegerEnv(config: Record<string, unknown>) {
  const coerced = { ...config };

  for (const key of INTEGER_ENV_KEYS) {
    const value = coerced[key];
    if (value === undefined || value === null || value === '') {
      continue;
    }

    coerced[key] = Number(value);
  }

  return coerced;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVariables, coerceIntegerEnv(config), {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
