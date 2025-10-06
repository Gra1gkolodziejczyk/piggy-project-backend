import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';

@Global()
export class DrizzleModule {
  static forRoot() {
    return {
      module: DrizzleModule,
      imports: [ConfigModule],
      providers: [DrizzleService],
      exports: [DrizzleService],
    };
  }
}
