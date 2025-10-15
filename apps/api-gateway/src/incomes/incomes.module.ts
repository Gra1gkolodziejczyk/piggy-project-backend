import { Module } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { INCOMES } from '@app/contracts/incomes/incomes.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: INCOMES,
        transport: Transport.TCP,
        options: {
          host: process.env.INCOMES_HOST || '127.0.0.1',
          port: Number(process.env.INCOMES_PORT) || 4007,
        },
      },
    ]),
  ],
  providers: [IncomesService],
  controllers: [IncomesController],
})
export class IncomesModule {}
