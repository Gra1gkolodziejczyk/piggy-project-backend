import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { BANKS_PATTERNS } from '@app/contracts/banks/banks.pattern';
import {
  BankResponseDto,
  UpdateBalanceDto,
  UpdateCurrencyDto,
} from '@app/contracts/banks/dto';
import { BANKS } from '@app/contracts/banks/banks.client';

@Injectable()
export class BanksService {
  constructor(@Inject(BANKS) private readonly banksClient: ClientProxy) {}

  getBank(userId: string): Observable<BankResponseDto> {
    return this.banksClient.send<BankResponseDto>(
      BANKS_PATTERNS.GET_BANK,
      { userId },
    );
  }

  addBalance(
    userId: string,
    updateBalanceDto: UpdateBalanceDto,
  ): Observable<BankResponseDto> {
    return this.banksClient.send<BankResponseDto>(
      BANKS_PATTERNS.ADD_BALANCE,
      {
        userId,
        ...updateBalanceDto,
      },
    );
  }


  subtractBalance(
    userId: string,
    updateBalanceDto: UpdateBalanceDto,
  ): Observable<BankResponseDto> {
    return this.banksClient.send<BankResponseDto>(
      BANKS_PATTERNS.SUBTRACT_BALANCE,
      {
        userId,
        ...updateBalanceDto,
      },
    );
  }

  updateCurrency(
    userId: string,
    updateCurrencyDto: UpdateCurrencyDto,
  ): Observable<BankResponseDto> {
    return this.banksClient.send<BankResponseDto>(
      BANKS_PATTERNS.UPDATE_CURRENCY,
      {
        userId,
        ...updateCurrencyDto,
      },
    );
  }
}
