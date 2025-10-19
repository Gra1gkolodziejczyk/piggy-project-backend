import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as schema from '@app/contracts/database/schema';
import {
  BankResponseDto,
  UpdateBalanceDto,
  UpdateCurrencyDto,
} from '@app/contracts/banks/dto';
import { DrizzleService } from '@app/contracts/drizzle/drizzle.service';

@Injectable()
export class BanksService {
  constructor(private readonly drizzle: DrizzleService) {}

  async getBank(userId: string): Promise<BankResponseDto> {
    const [bank] = await this.drizzle.db
      .select()
      .from(schema.banks)
      .where(eq(schema.banks.userId, userId))
      .limit(1);

    if (!bank) {
      throw new NotFoundException(
        `Compte bancaire non trouvé pour l'utilisateur ${userId}`,
      );
    }

    return this.mapToBankResponseDto(bank);
  }


  async addBalance(
    userId: string,
    updateBalanceDto: UpdateBalanceDto,
  ): Promise<BankResponseDto> {
    const { amount, description } = updateBalanceDto;

    if (amount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    try {
      const result = await this.drizzle.db.transaction(async (tx) => {
        const [bank] = await tx
          .select()
          .from(schema.banks)
          .where(eq(schema.banks.userId, userId))
          .limit(1);

        if (!bank) {
          throw new NotFoundException(
            `Compte bancaire non trouvé pour l'utilisateur ${userId}`,
          );
        }

        const currentBalance = parseFloat(bank.balance);
        const newBalance = currentBalance + amount;

        const [updatedBank] = await tx
          .update(schema.banks)
          .set({
            balance: newBalance.toFixed(2),
            lastUpdatedAt: new Date(),
          })
          .where(eq(schema.banks.userId, userId))
          .returning();

        await tx.insert(schema.transactions).values({
          userId,
          type: 'adjustment',
          amount: amount.toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description:
            description || `Ajout manuel de ${amount} ${bank.currency}`,
          transactionDate: new Date(),
        });

        return updatedBank;
      });

      return this.mapToBankResponseDto(result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erreur lors de l\'ajout au solde',
        error.message,
      );
    }
  }


  async subtractBalance(
    userId: string,
    updateBalanceDto: UpdateBalanceDto,
  ): Promise<BankResponseDto> {
    const { amount, description } = updateBalanceDto;

    if (amount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    try {
      const result = await this.drizzle.db.transaction(async (tx) => {
        const [bank] = await tx
          .select()
          .from(schema.banks)
          .where(eq(schema.banks.userId, userId))
          .limit(1);

        if (!bank) {
          throw new NotFoundException(
            `Compte bancaire non trouvé pour l'utilisateur ${userId}`,
          );
        }

        const currentBalance = parseFloat(bank.balance);
        const newBalance = currentBalance - amount;

        const [updatedBank] = await tx
          .update(schema.banks)
          .set({
            balance: newBalance.toFixed(2),
            lastUpdatedAt: new Date(),
          })
          .where(eq(schema.banks.userId, userId))
          .returning();

        await tx.insert(schema.transactions).values({
          userId,
          type: 'adjustment',
          amount: `-${amount.toFixed(2)}`,
          balanceAfter: newBalance.toFixed(2),
          description:
            description || `Retrait manuel de ${amount} ${bank.currency}`,
          transactionDate: new Date(),
        });

        return updatedBank;
      });

      return this.mapToBankResponseDto(result);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erreur lors du retrait du solde',
        error.message,
      );
    }
  }


  async updateCurrency(
    userId: string,
    updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<BankResponseDto> {
    const { currency } = updateCurrencyDto;

    try {
      const [bank] = await this.drizzle.db
        .select()
        .from(schema.banks)
        .where(eq(schema.banks.userId, userId))
        .limit(1);

      if (!bank) {
        throw new NotFoundException(
          `Compte bancaire non trouvé pour l'utilisateur ${userId}`,
        );
      }

      const [updatedBank] = await this.drizzle.db
        .update(schema.banks)
        .set({
          currency,
          lastUpdatedAt: new Date(),
        })
        .where(eq(schema.banks.userId, userId))
        .returning();

      return this.mapToBankResponseDto(updatedBank);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour de la devise',
        error.message,
      );
    }
  }


  private mapToBankResponseDto(bank: schema.Bank): BankResponseDto {
    return {
      id: bank.id,
      userId: bank.userId,
      balance: bank.balance,
      currency: bank.currency,
      lastUpdatedAt: bank.lastUpdatedAt,
      createdAt: bank.createdAt,
    };
  }
}
