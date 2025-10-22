import { ConfigModule } from '@nestjs/config';
import { DrizzleService } from './drizzle.service';
import { Global } from '@nestjs/common';

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
