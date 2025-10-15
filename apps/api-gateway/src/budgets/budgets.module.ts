import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsController } from './budgets.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BUDGETS } from '@app/contracts/budgets/budgets.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: BUDGETS,
        transport: Transport.TCP,
        options: {
          host: process.env.BUDGETS_HOST || '127.0.0.1',
          port: Number(process.env.BUDGETS_PORT) || 4004,
        },
      },
    ]),
  ],
  providers: [BudgetsService],
  controllers: [BudgetsController],
})
export class IncomesModule {}
