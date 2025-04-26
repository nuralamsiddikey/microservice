// auth-service/src/rabbitmq/rabbitmq.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }
  private async connect() {
    try {
      // Use correct type casting for the amqplib connection
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
      if (!rabbitmqUrl) {
        throw new Error('RABBITMQ_URL is not defined');
      }
      
      // Cast the connection to the proper type
      this.connection = await amqp.connect(rabbitmqUrl) as unknown as amqp.Connection;
      this.channel = await (this.connection as any).createChannel();
      
      // Declare exchanges we'll use
      if (this.channel) {
        await this.channel.assertExchange('auth_exchange', 'topic', { durable: true });
      } else {
        throw new Error('Channel is not initialized');
      }
      
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Retry connection after delay
      setTimeout(() => this.connect(), 5000);
    }
  }

  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await (this.connection as any).close();
    } catch (error) {
      console.error('Error closing RabbitMQ connections:', error);
    }
  }

  async publishMessage(exchange: string, routingKey: string, message: any) {
    if (!this.channel) {
      await this.connect();
    }
    
    const messageBuffer = Buffer.from(JSON.stringify(message));
    if (this.channel) {
      return this.channel.publish(exchange, routingKey, messageBuffer, { persistent: true });
    } else {
      throw new Error('Channel is not initialized');
    }
  }

  async consumeMessages(queue: string, exchange: string, pattern: string, callback: (message: any) => void) {
    if (!this.channel) {
      await this.connect();
    }
    
    // Assert queue and bind to exchange with routing pattern
    if (this.channel) {
      await this.channel.assertQueue(queue, { durable: true });
    } else {
      throw new Error('Channel is not initialized');
    }
    await this.channel.bindQueue(queue, exchange, pattern);
    
    // Start consuming messages
    await this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        if (this.channel) {
          this.channel.ack(msg);
        } else {
          console.error('Channel is not initialized to acknowledge the message');
        }
      }
    });
  }
}