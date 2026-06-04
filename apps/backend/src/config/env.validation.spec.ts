import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const validConfig = {
    PORT: '4000',
    DB_HOST: 'postgres',
    DB_PORT: '5432',
    DB_USERNAME: 'books',
    DB_PASSWORD: 'books',
    DB_NAME: 'books_db',
    ELASTICSEARCH_NODE: 'http://elasticsearch:9200',
    ELASTICSEARCH_INDEX: 'books',
    RABBITMQ_URL: 'amqp://guest:guest@rabbitmq:5672',
    RABBITMQ_QUEUE: 'book_upload_queue',
    REDIS_URL: 'redis://redis:6379',
    CACHE_TTL_SECONDS: '120',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1d',
  };

  it('accepts string env values for numeric fields', () => {
    const result = validateEnv(validConfig);

    expect(result.PORT).toBe(4000);
    expect(result.DB_PORT).toBe(5432);
    expect(result.CACHE_TTL_SECONDS).toBe(120);
  });

  it('throws when PORT is out of range', () => {
    expect(() =>
      validateEnv({
        ...validConfig,
        PORT: '70000',
      }),
    ).toThrow();
  });

  it('throws when numeric env values are invalid', () => {
    expect(() =>
      validateEnv({
        ...validConfig,
        DB_PORT: 'not-a-number',
      }),
    ).toThrow();
  });

});
