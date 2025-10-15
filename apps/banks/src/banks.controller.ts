import { Controller, Get } from '@nestjs/common';
import { BanksService } from './banks.service';

@Controller()
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  getHello(): string {
    return this.banksService.getHello();
  }
}
