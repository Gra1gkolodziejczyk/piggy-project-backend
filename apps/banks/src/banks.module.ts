import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DrizzleModule.forRoot(),
  ],
  controllers: [BanksController],
  providers: [BanksService],
})
export class BanksModule {}
