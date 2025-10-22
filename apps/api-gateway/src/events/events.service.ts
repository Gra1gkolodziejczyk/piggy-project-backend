import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EVENTS } from '@app/contracts/events/events.client';
@Injectable()
export class EventsService {
  constructor(@Inject(EVENTS) private readonly eventsClient: ClientProxy) {}
}
