import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BANKS } from '@app/contracts/banks/banks.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: BANKS,
        transport: Transport.TCP,
        options: {
          host: process.env.BANKS_HOST || '127.0.0.1',
          port: Number(process.env.BANKS_PORT) || 4003,
        },
      },
    ]),
  ],
  providers: [BanksService],
  controllers: [BanksController],
})
export class IncomesModule {}
