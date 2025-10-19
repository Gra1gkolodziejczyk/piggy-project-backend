import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BanksService } from './banks.service';
import { BANKS_PATTERNS } from '@app/contracts/banks/banks.pattern';
import {
  BankResponseDto,
  UpdateBalanceDto,
  UpdateCurrencyDto,
} from '@app/contracts/banks/dto';

@Controller()
export class BanksController {
  constructor(private readonly banksService: BanksService) {}
  @MessagePattern(BANKS_PATTERNS.GET_BANK)
  async getBank(
    @Payload() payload: { userId: string },
  ): Promise<BankResponseDto> {
    return this.banksService.getBank(payload.userId);
  }

  @MessagePattern(BANKS_PATTERNS.ADD_BALANCE)
  async addBalance(
    @Payload() payload: { userId: string } & UpdateBalanceDto,
  ): Promise<BankResponseDto> {
    const { userId, ...dto } = payload;
    return this.banksService.addBalance(userId, dto);
  }

  @MessagePattern(BANKS_PATTERNS.SUBTRACT_BALANCE)
  async subtractBalance(
    @Payload() payload: { userId: string } & UpdateBalanceDto,
  ): Promise<BankResponseDto> {
    const { userId, ...dto } = payload;
    return this.banksService.subtractBalance(userId, dto);
  }

  @MessagePattern(BANKS_PATTERNS.UPDATE_CURRENCY)
  async updateCurrency(
    @Payload() payload: { userId: string } & UpdateCurrencyDto,
  ): Promise<BankResponseDto> {
    const { userId, ...dto } = payload;
    return this.banksService.updateCurrency(userId, dto);
  }
}
