import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BANKS_PATTERNS } from '@app/contracts/banks/banks.pattern';

@Injectable()
export class BanksService {
  constructor(
    @Inject('BANKS_SERVICE') private readonly banksClient: ClientProxy,
  ) {}
}
