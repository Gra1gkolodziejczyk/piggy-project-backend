import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EXPENSES } from '@app/contracts/expenses/expenses.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EXPENSES,
        transport: Transport.TCP,
        options: {
          host: process.env.EXPENSES_HOST || '127.0.0.1',
          port: Number(process.env.EXPENSES_PORT) || 4005,
        },
      },
    ]),
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
