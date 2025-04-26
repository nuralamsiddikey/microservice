import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
