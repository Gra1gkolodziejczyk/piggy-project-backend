import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '@app/contracts/drizzle/drizzle.service';
import { incomes, banks, Income } from '@app/contracts/database/schema';
import { CreateIncomeDto } from '@app/contracts/incomes/dto/create-income.dto';
import { UpdateIncomeDto } from '@app/contracts/incomes/dto/update-income.dto';

@Injectable()
export class IncomesService {
  private readonly logger = new Logger(IncomesService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async create(userId: string, dto: CreateIncomeDto): Promise<Income> {
    this.logger.log(`Creating income for user ${userId}: ${dto.name}`);

    const [bank] = await this.drizzle.db
      .select()
      .from(banks)
      .where(eq(banks.userId, userId))
      .limit(1);

    if (!bank) {
      throw new NotFoundException(
        "Aucun compte bancaire trouvé. Veuillez créer un compte bancaire d'abord.",
      );
    }

    const nextPaymentDate = new Date(dto.nextPaymentDate);
    const now = new Date();

    if (nextPaymentDate < now) {
      throw new BadRequestException(
        'La date de prochaine perception doit être dans le futur',
      );
    }

    const [income] = await this.drizzle.db
      .insert(incomes)
      .values({
        userId,
        name: dto.name,
        type: dto.type,
        amount: dto.amount.toString(),
        frequency: dto.frequency,
        nextPaymentDate,
        isRecurring: dto.isRecurring,
        description: dto.description,
        isActive: true,
      })
      .returning();

    return income;
  }


  async findAll(userId: string): Promise<Income[]> {
    const userIncomes = await this.drizzle.db
      .select()
      .from(incomes)
      .where(
        and(
          eq(incomes.userId, userId),
          eq(incomes.isActive, true),
          eq(incomes.isArchived, false),
        ),
      );
    return userIncomes;
  }


  async findOne(userId: string, incomeId: string): Promise<Income> {
    const [income] = await this.drizzle.db
      .select()
      .from(incomes)
      .where(eq(incomes.id, incomeId))
      .limit(1);

    if (!income) {
      throw new NotFoundException(`Revenu ${incomeId} introuvable`);
    }

    if (income.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'accéder à ce revenu",
      );
    }

    return income;
  }

  async update(
    userId: string,
    incomeId: string,
    dto: UpdateIncomeDto,
  ): Promise<Income> {
    await this.findOne(userId, incomeId);
    if (dto.nextPaymentDate) {
      const nextPaymentDate = new Date(dto.nextPaymentDate);
      const now = new Date();

      if (nextPaymentDate < now) {
        throw new BadRequestException(
          'La date de prochaine perception doit être dans le futur',
        );
      }
    }

    const [updatedIncome] = await this.drizzle.db
      .update(incomes)
      .set({
        ...dto,
        amount: dto.amount ? dto.amount.toString() : undefined,
        nextPaymentDate: dto.nextPaymentDate
          ? new Date(dto.nextPaymentDate)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(incomes.id, incomeId))
      .returning();

    if (!updatedIncome) {
      throw new NotFoundException(`Revenu ${incomeId} introuvable`);
    }

    return updatedIncome;
  }

  async delete(
    userId: string,
    incomeId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(userId, incomeId);
    const [result] = await this.drizzle.db
      .update(incomes)
      .set({
        isActive: false,
        isArchived: true,
        archivedAt: new Date(),
      })
      .where(eq(incomes.id, incomeId))
      .returning();

    if (!result) {
      throw new NotFoundException(`Income ${incomeId} could not be deleted`);
    }

    return {
      success: true,
      message: 'Income archived successfully',
    };
  }

  async hardDelete(
    userId: string,
    incomeId: string,
  ): Promise<{ success: boolean; message: string }> {
    const income = await this.findOne(userId, incomeId);

    const result = await this.drizzle.db
      .delete(incomes)
      .where(eq(incomes.id, incomeId))
      .returning();

    if (result.length === 0) {
      this.logger.error(`Failed to hard delete income ${incomeId}`);
      throw new NotFoundException(
        `Income ${incomeId} could not be permanently deleted`,
      );
    }

    return {
      success: true,
      message: 'Income permanently deleted',
    };
  }
}
