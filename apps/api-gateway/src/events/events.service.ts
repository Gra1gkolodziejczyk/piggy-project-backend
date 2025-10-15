import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EVENTS_PATTERNS } from '@app/contracts/events/events.pattern';

@Injectable()
export class EventsService {
  constructor(
    @Inject('EVENTS_SERVICE') private readonly eventsClient: ClientProxy,
  ) {}
}
