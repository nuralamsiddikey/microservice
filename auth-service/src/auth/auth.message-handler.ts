import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class AuthMessageHandler implements OnModuleInit {
  constructor(
    private authService: AuthService,
    private rabbitmqService: RabbitmqService,
  ) {}

  async onModuleInit() {
    await this.setupConsumers();
  }

  async setupConsumers() {
    // Listen for token validation requests
    await this.rabbitmqService.consumeMessages(
      'auth_token_validation',
      'auth_exchange',
      'token.validate',
      async (message) => {
        const { token, correlationId } = message;
        
        // Validate the token
        const validationResult = await this.authService.validateToken(token);
        
        // Send back the validation result
        await this.rabbitmqService.publishMessage(
          'auth_exchange',
          `token.validate.response.${correlationId}`,
          validationResult
        );
      }
    );
  }
}