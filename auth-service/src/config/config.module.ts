import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config'; 
import * as dotenv from 'dotenv';

dotenv.config();  

@Module({
  imports: [
    NestConfigModule.forRoot({ 
      isGlobal: true,  
    }),
  ],
  exports: [NestConfigModule], 
})
export class ConfigModule {}
