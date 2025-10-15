import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DrizzleModule.forRoot(),
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class BanksModule {}
