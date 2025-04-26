// src/config/config.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config'; // Import the correct ConfigModule
import * as dotenv from 'dotenv';

dotenv.config();  // Ensure that environment variables are loaded

@Module({
  imports: [
    NestConfigModule.forRoot({ // Set up the config module to load .env variables
      isGlobal: true,  // Make the config globally available across your application
    }),
  ],
  exports: [NestConfigModule], // Export the ConfigModule so other modules can use it
})
export class ConfigModule {}
