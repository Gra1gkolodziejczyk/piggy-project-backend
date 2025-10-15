import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';
import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DrizzleModule,
  ],
  controllers: [IncomesController],
  providers: [IncomesService],
})
export class BanksModule {}
