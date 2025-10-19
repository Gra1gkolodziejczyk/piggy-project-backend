import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '@app/contracts/drizzle/drizzle.service';
import * as schema from '@app/contracts/database/schema';
import {
  UpdateExpenseDto,
  ExpenseResponseDto,
  CreateExpenseDto,
  ExpenseListResponseDto,
  FindAllExpensesQueryDto,
  SplitPercentageDto,
} from '@app/contracts/expenses/dto';


@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async create(
    userId: string,
    dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    this.logger.log(`Creating expense for user ${userId}: ${dto.name}`);

    // Validation du montant
    if (dto.amount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    if (dto.splitPercentages) {
      this.validateSplitPercentages(dto.splitPercentages);
    }

    try {
      const result = await this.drizzle.db.transaction(async (tx) => {
        const [expense] = await tx
          .insert(schema.expenses)
          .values({
            userId,
            name: dto.name,
            icon: dto.icon,
            category: dto.category,
            description: dto.description,
            amount: dto.amount.toFixed(2),
            frequency: dto.frequency || 'once',
            isRecurring: dto.isRecurring || false,
            nextPaymentDate: dto.nextPaymentDate,
            splitPercentages: dto.splitPercentages,
            isActive: true,
          })
          .returning();

        const amountToDebit = this.calculateUserAmount(
          dto.amount,
          dto.splitPercentages,
        );

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
        const newBalance = currentBalance - amountToDebit;

        await tx
          .update(schema.banks)
          .set({
            balance: newBalance.toFixed(2),
            lastUpdatedAt: new Date(),
          })
          .where(eq(schema.banks.userId, userId));

        const splitInfo = dto.splitPercentages
          ? ` (${this.getUserPercentage(dto.splitPercentages)}% de ${dto.amount.toFixed(2)})`
          : '';

        await tx.insert(schema.transactions).values({
          userId,
          type: 'expense',
          amount: `-${amountToDebit.toFixed(2)}`,
          balanceAfter: newBalance.toFixed(2),
          description: `Dépense: ${dto.name}${splitInfo}`,
          expenseId: expense.id,
          transactionDate: new Date(),
        });

        this.logger.log(
          `Expense created: ${expense.id}, Bank debited: ${amountToDebit.toFixed(2)} ${bank.currency}`,
        );

        return expense;
      });

      return this.mapToExpenseResponseDto(result);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error creating expense: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la création de la dépense',
        error.message,
      );
    }
  }

  async findAll(userId: string): Promise<ExpenseResponseDto[]> {
    this.logger.log(`Fetching active expenses for user ${userId}`);

    const activeExpenses = await this.drizzle.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.userId, userId));

    const filtered = activeExpenses.filter(
      (expense) => expense.isActive && !expense.isArchived,
    );

    this.logger.log(`Found ${filtered.length} active expenses for user ${userId}`);

    return filtered.map((expense) => this.mapToExpenseResponseDto(expense));
  }

  async findOne(userId: string, expenseId: string): Promise<ExpenseResponseDto> {
    this.logger.log(`Fetching expense ${expenseId} for user ${userId}`);

    const [expense] = await this.drizzle.db
      .select()
      .from(schema.expenses)
      .where(eq(schema.expenses.id, expenseId))
      .limit(1);

    if (!expense) {
      throw new NotFoundException(`Dépense ${expenseId} introuvable`);
    }

    if (expense.userId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to access expense ${expenseId} owned by ${expense.userId}`,
      );
      throw new NotFoundException(`Dépense ${expenseId} introuvable`);
    }

    return this.mapToExpenseResponseDto(expense);
  }


  async update(
    userId: string,
    expenseId: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    this.logger.log(`Updating expense ${expenseId} for user ${userId}`);

    if (dto.splitPercentages) {
      this.validateSplitPercentages(dto.splitPercentages);
    }

    try {
      const result = await this.drizzle.db.transaction(async (tx) => {
        const [currentExpense] = await tx
          .select()
          .from(schema.expenses)
          .where(eq(schema.expenses.id, expenseId))
          .limit(1);

        if (!currentExpense) {
          throw new NotFoundException(`Dépense ${expenseId} introuvable`);
        }

        if (currentExpense.userId !== userId) {
          throw new NotFoundException(`Dépense ${expenseId} introuvable`);
        }

        const oldAmount = parseFloat(currentExpense.amount);
        const newAmount = dto.amount !== undefined ? dto.amount : oldAmount;

        const oldSplit = currentExpense.splitPercentages as
          | Array<{ name: string; percentage: number }>
          | null;
        const newSplit = dto.splitPercentages !== undefined
          ? dto.splitPercentages
          : oldSplit;

        const oldUserAmount = this.calculateUserAmount(oldAmount, oldSplit);
        const newUserAmount = this.calculateUserAmount(newAmount, newSplit);

        const difference = oldUserAmount - newUserAmount;

        const [updatedExpense] = await tx
          .update(schema.expenses)
          .set({
            name: dto.name,
            icon: dto.icon,
            category: dto.category,
            description: dto.description,
            amount: dto.amount !== undefined ? dto.amount.toFixed(2) : undefined,
            frequency: dto.frequency,
            isRecurring: dto.isRecurring,
            nextPaymentDate: dto.nextPaymentDate,
            splitPercentages: dto.splitPercentages,
            updatedAt: new Date(),
          })
          .where(eq(schema.expenses.id, expenseId))
          .returning();

        if (Math.abs(difference) > 0.01) {
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
          const newBalance = currentBalance + difference;

          await tx
            .update(schema.banks)
            .set({
              balance: newBalance.toFixed(2),
              lastUpdatedAt: new Date(),
            })
            .where(eq(schema.banks.userId, userId));

          const adjustmentType =
            difference > 0 ? 'réduction' : 'augmentation';
          await tx.insert(schema.transactions).values({
            userId,
            type: 'expense',
            amount: difference.toFixed(2),
            balanceAfter: newBalance.toFixed(2),
            description: `Ajustement dépense: ${updatedExpense.name} (${adjustmentType})`,
            expenseId: updatedExpense.id,
            transactionDate: new Date(),
          });

          this.logger.log(
            `Bank adjusted by ${difference.toFixed(2)} ${bank.currency} due to expense update`,
          );
        }

        this.logger.log(`Expense ${expenseId} updated successfully`);
        return updatedExpense;
      });

      return this.mapToExpenseResponseDto(result);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(`Error updating expense: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour de la dépense',
        error.message,
      );
    }
  }


  async delete(
    userId: string,
    expenseId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Soft deleting expense ${expenseId} for user ${userId}`);

    try {
      await this.drizzle.db.transaction(async (tx) => {
        // ÉTAPE 1 : Récupérer la dépense
        const [expense] = await tx
          .select()
          .from(schema.expenses)
          .where(eq(schema.expenses.id, expenseId))
          .limit(1);

        if (!expense) {
          throw new NotFoundException(`Dépense ${expenseId} introuvable`);
        }

        if (expense.userId !== userId) {
          throw new NotFoundException(`Dépense ${expenseId} introuvable`);
        }

        const amount = parseFloat(expense.amount);
        const split = expense.splitPercentages as
          | Array<{ name: string; percentage: number }>
          | null;
        const amountToCredit = this.calculateUserAmount(amount, split);

        await tx
          .update(schema.expenses)
          .set({
            isActive: false,
            isArchived: true,
            archivedAt: new Date(),
          })
          .where(eq(schema.expenses.id, expenseId));

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
        const newBalance = currentBalance + amountToCredit;

        await tx
          .update(schema.banks)
          .set({
            balance: newBalance.toFixed(2),
            lastUpdatedAt: new Date(),
          })
          .where(eq(schema.banks.userId, userId));

        await tx.insert(schema.transactions).values({
          userId,
          type: 'expense',
          amount: amountToCredit.toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description: `Suppression dépense: ${expense.name}`,
          expenseId: expense.id,
          transactionDate: new Date(),
        });

        this.logger.log(
          `Expense ${expenseId} archived, bank credited: ${amountToCredit.toFixed(2)} ${bank.currency}`,
        );
      });

      return {
        success: true,
        message: 'Dépense archivée avec succès',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error deleting expense: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la suppression de la dépense',
        error.message,
      );
    }
  }


  private calculateUserAmount(
    amount: number,
    splitPercentages: Array<{ name: string; percentage: number }> | null,
  ): number {
    if (!splitPercentages || splitPercentages.length === 0) {
      return amount;
    }

    const equalShare = 100 / splitPercentages.length;

    return (amount * equalShare) / 100;
  }

  private getUserPercentage(
    splitPercentages: Array<{ name: string; percentage: number }>,
  ): number {
    const equalShare = 100 / splitPercentages.length;
    return parseFloat(equalShare.toFixed(2));
  }

  private validateSplitPercentages(
    splitPercentages: Array<{ name: string; percentage: number }>,
  ): void {
    if (!splitPercentages || splitPercentages.length === 0) {
      throw new BadRequestException(
        'Le split doit contenir au moins 1 participant',
      );
    }

    const totalPercentage = splitPercentages.reduce(
      (sum, p) => sum + p.percentage,
      0,
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException(
        `La somme des pourcentages doit être égale à 100% (actuel: ${totalPercentage.toFixed(2)}%)`,
      );
    }

    for (const participant of splitPercentages) {
      if (participant.percentage <= 0) {
        throw new BadRequestException(
          `Le pourcentage de ${participant.name} doit être supérieur à 0`,
        );
      }
    }
  }

  async hardDelete(
    userId: string,
    expenseId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.warn(
      `⚠️ HARD DELETE requested for expense ${expenseId} by user ${userId}`,
    );

    try {
      await this.drizzle.db.transaction(async (tx) => {
        const [expense] = await tx
          .select()
          .from(schema.expenses)
          .where(eq(schema.expenses.id, expenseId))
          .limit(1);

        if (!expense) {
          throw new NotFoundException(`Dépense ${expenseId} introuvable`);
        }

        if (expense.userId !== userId) {
          throw new NotFoundException(`Dépense ${expenseId} introuvable`);
        }

        const amount = parseFloat(expense.amount);
        const split = expense.splitPercentages as
          | Array<{ name: string; percentage: number }>
          | null;
        const amountToCredit = this.calculateUserAmount(amount, split);

        await tx
          .delete(schema.expenses)
          .where(eq(schema.expenses.id, expenseId));

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
        const newBalance = currentBalance + amountToCredit;

        await tx
          .update(schema.banks)
          .set({
            balance: newBalance.toFixed(2),
            lastUpdatedAt: new Date(),
          })
          .where(eq(schema.banks.userId, userId));

        await tx.insert(schema.transactions).values({
          userId,
          type: 'expense',
          amount: amountToCredit.toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description: `Suppression DÉFINITIVE de la dépense: ${expense.name}`,
          transactionDate: new Date(),
        });

        this.logger.warn(
          `✅ Expense ${expenseId} PERMANENTLY DELETED from database`,
        );
      });

      return {
        success: true,
        message: 'Dépense supprimée définitivement',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error hard deleting expense: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Erreur lors de la suppression définitive de la dépense',
        error.message,
      );
    }
  }

  private mapToExpenseResponseDto(
    expense: schema.Expense,
  ): ExpenseResponseDto {
    return {
      id: expense.id,
      userId: expense.userId,
      name: expense.name,
      icon: expense.icon,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      frequency: expense.frequency,
      isRecurring: expense.isRecurring,
      nextPaymentDate: expense.nextPaymentDate,
      splitPercentages: expense.splitPercentages as
        | Array<{ name: string; percentage: number }>
        | null,
      isActive: expense.isActive,
      isArchived: expense.isArchived,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
      archivedAt: expense.archivedAt,
    };
  }
}
