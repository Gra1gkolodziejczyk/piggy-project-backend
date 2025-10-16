import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENTS } from '@app/contracts/events/events.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EVENTS,
        transport: Transport.TCP,
        options: {
          host: process.env.EVENTS_HOST || '127.0.0.1',
          port: Number(process.env.EVENTS_PORT) || 4006,
        },
      },
    ]),
  ],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
