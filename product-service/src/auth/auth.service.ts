import { Injectable ,UnauthorizedException} from '@nestjs/common';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
  constructor(private rabbitmqService: RabbitmqService) {}

  async validateToken(token: string): Promise<any> {
    try {
      const correlationId = uuidv4();
      
      const response = await this.rabbitmqService.requestResponse(
        'auth_exchange',
        'token.validate',
        { token, correlationId },
        `token.validate.response.${correlationId}`
      );
      
      if (!response.valid) {
        throw new UnauthorizedException('Invalid token');
      }
      
      return response.user;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}