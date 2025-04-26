// auth-service/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';



@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private rabbitmqService: RabbitmqService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(registerDto);

    // Publish user created event
    await this.rabbitmqService.publishMessage('auth_exchange', 'user.created', {
      userId: user?._id?.toString() || '',
      email: user.email,
      role: user.role,
    });

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET') || '',
      );
      return { valid: true, user: payload };
    } catch (error) {
      return { valid: false };
    }
  }

  private generateAccessToken(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return jwt.sign(
      payload,
      this.configService.get<string>('JWT_SECRET') || '',
      { expiresIn: '1h' },
    );
  }

  private generateRefreshToken(user: any) {
    const payload = {
      sub: user._id.toString(),
    };

    return jwt.sign(
      payload,
      this.configService.get<string>('JWT_REFRESH_SECRET') || '',
      { expiresIn: '7d' },
    );
  }
}
