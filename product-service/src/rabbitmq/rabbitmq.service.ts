// product-service/src/rabbitmq/rabbitmq.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private responseCallbacks = new Map();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');

      if (!rabbitmqUrl) {
        throw new Error('RABBITMQ_URL is not defined in environment variables');
      }

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchanges we'll use
      await this.channel.assertExchange('auth_exchange', 'topic', {
        durable: true,
      });

      console.log('Connected product service to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Retry connection after delay
      setTimeout(() => this.connect(), 5000);
    }
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  async publishMessage(exchange: string, routingKey: string, message: any) {
    if (!this.channel) {
      await this.connect();
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    return this.channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
    });
  }

  async consumeMessages(
    queue: string,
    exchange: string,
    pattern: string,
    callback: (message: any) => void,
  ) {
    if (!this.channel) {
      await this.connect();
    }

    // Assert queue and bind to exchange with routing pattern
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, pattern);

    // Start consuming messages
    await this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        this.channel.ack(msg);
      }
    });
  }

  // For RPC-style requests
  async requestResponse(
    exchange: string,
    routingKey: string,
    message: any,
    responsePattern: string,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.channel) {
          await this.connect();
        }

        const correlationId = message.correlationId;
        const tempQueue = `response-queue-${correlationId}`;

        // Create a temporary queue for the response
        await this.channel.assertQueue(tempQueue, {
          exclusive: true,
          autoDelete: true,
        });
        await this.channel.bindQueue(tempQueue, exchange, responsePattern);

        // Set up a consumer for the response
        await this.channel.consume(tempQueue, (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            this.channel.ack(msg);
            resolve(content);

            // Clean up
            this.channel
              .unbindQueue(tempQueue, exchange, responsePattern)
              .then(() => this.channel.deleteQueue(tempQueue));
          }
        });

        // Send the request
        this.publishMessage(exchange, routingKey, message);

        // Set a timeout for the response
        setTimeout(() => {
          reject(new Error('Request timed out'));
          this.channel.deleteQueue(tempQueue);
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }
}
