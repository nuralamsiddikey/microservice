import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { AuthMessageHandler } from './auth.message-handler';

@Module({
  imports: [UsersModule, ConfigModule, RabbitmqModule],
  controllers: [AuthController],
  providers: [AuthService,AuthMessageHandler],
})
export class AuthModule {}
