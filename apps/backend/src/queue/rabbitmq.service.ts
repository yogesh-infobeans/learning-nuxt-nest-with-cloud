import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';

type ConsumerHandler = (payload: unknown) => Promise<void>;

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  private async init() {
    if (this.initialized) {
      return;
    }

    const url = this.configService.getOrThrow<string>('RABBITMQ_URL');
    const queue = this.configService.getOrThrow<string>('RABBITMQ_QUEUE');

    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(queue, { durable: true });
    this.initialized = true;
    this.logger.log(`RabbitMQ connected, queue: ${queue}`);
  }

  async publish(payload: Record<string, unknown>) {
    await this.init();
    const queue = this.configService.getOrThrow<string>('RABBITMQ_QUEUE');
    const body = Buffer.from(JSON.stringify(payload));
    this.channel!.sendToQueue(queue, body, { persistent: true });
  }

  async consume(handler: ConsumerHandler) {
    await this.init();
    const queue = this.configService.getOrThrow<string>('RABBITMQ_QUEUE');
    await this.channel!.consume(queue, async (message) => {
      if (!message) {
        return;
      }

      try {
        const payload = JSON.parse(message.content.toString()) as unknown;
        await handler(payload);
        this.channel!.ack(message);
      } catch (error) {
        this.logger.error('Failed to process queue message', error as Error);
        this.channel!.nack(message, false, false);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
