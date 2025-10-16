import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '@app/contracts/drizzle/drizzle.service';
import { expenses, budgets, Expense } from '@app/contracts/database/schema';
import { CreateExpenseDto } from '@app/contracts/expenses/dto/create-expense.dto';
import { UpdateExpenseDto } from '@app/contracts/expenses/dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  /**
   * Créer une nouvelle dépense
   */
  async create(userId: string, dto: CreateExpenseDto): Promise<Expense> {
    this.logger.log(`Creating expense for user ${userId}: ${dto.name}`);

    // Vérifier que le budget existe et appartient à l'utilisateur
    const [budget] = await this.drizzle.db
      .select()
      .from(budgets)
      .where(eq(budgets.id, dto.budgetId))
      .limit(1);

    if (!budget) {
      throw new NotFoundException(`Budget ${dto.budgetId} introuvable`);
    }

    if (budget.ownerId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'ajouter des dépenses à ce budget",
      );
    }

    const [expense] = await this.drizzle.db
      .insert(expenses)
      .values({
        budgetId: dto.budgetId,
        name: dto.name,
        description: dto.description,
        amount: dto.amount.toString(),
        frequency: dto.frequency,
        dueDay: dto.dueDay,
        isActive: true,
      })
      .returning();

    this.logger.log(`Expense created successfully: ${expense.id}`);
    return expense;
  }

  /**
   * Récupérer toutes les dépenses actives d'un utilisateur
   */
  async findAll(userId: string): Promise<Expense[]> {
    this.logger.log(`Fetching active expenses for user ${userId}`);

    // Récupérer tous les budgets de l'utilisateur
    const userBudgets = await this.drizzle.db
      .select()
      .from(budgets)
      .where(eq(budgets.ownerId, userId));

    if (userBudgets.length === 0) {
      return [];
    }

    const budgetIds = userBudgets.map((b) => b.id);

    // Récupérer toutes les dépenses
    const allExpenses = await this.drizzle.db.select().from(expenses);

    // Filtrer pour ne garder que les dépenses actives des budgets de l'utilisateur
    const activeExpenses = allExpenses.filter(
      (expense) =>
        budgetIds.includes(expense.budgetId) &&
        expense.isActive &&
        !expense.isArchived,
    );

    this.logger.log(
      `Found ${activeExpenses.length} active expenses for user ${userId}`,
    );
    return activeExpenses;
  }

  /**
   * Récupérer une dépense spécifique par son ID
   */
  async findOne(userId: string, expenseId: string): Promise<Expense> {
    this.logger.log(`Fetching expense ${expenseId} for user ${userId}`);

    const [expense] = await this.drizzle.db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .limit(1);

    if (!expense) {
      throw new NotFoundException(`Dépense ${expenseId} introuvable`);
    }

    // Vérifier que l'utilisateur a accès à cette dépense
    const [budget] = await this.drizzle.db
      .select()
      .from(budgets)
      .where(eq(budgets.id, expense.budgetId))
      .limit(1);

    if (!budget || budget.ownerId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to access expense ${expenseId}`,
      );
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'accéder à cette dépense",
      );
    }

    return expense;
  }

  /**
   * Mettre à jour une dépense
   */
  async update(
    userId: string,
    expenseId: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    this.logger.log(`Updating expense ${expenseId} for user ${userId}`);

    await this.findOne(userId, expenseId);

    const [updatedExpense] = await this.drizzle.db
      .update(expenses)
      .set({
        ...dto,
        amount: dto.amount ? dto.amount.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, expenseId))
      .returning();

    if (!updatedExpense) {
      throw new NotFoundException(`Dépense ${expenseId} introuvable`);
    }

    this.logger.log(`Expense ${expenseId} updated successfully`);
    return updatedExpense;
  }

  /**
   * Supprimer une dépense (soft delete)
   */
  async delete(
    userId: string,
    expenseId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Soft deleting expense ${expenseId} for user ${userId}`);

    await this.findOne(userId, expenseId);

    const [result] = await this.drizzle.db
      .update(expenses)
      .set({
        isActive: false,
        isArchived: true,
        archivedAt: new Date(),
      })
      .where(eq(expenses.id, expenseId))
      .returning();

    if (!result) {
      throw new NotFoundException(`Expense ${expenseId} could not be deleted`);
    }

    this.logger.log(`Expense ${expenseId} soft deleted successfully`);

    return {
      success: true,
      message: 'Expense archived successfully',
    };
  }

  /**
   * Supprimer DÉFINITIVEMENT une dépense (hard delete)
   */
  async hardDelete(
    userId: string,
    expenseId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.warn(
      `⚠️ HARD DELETE requested for expense ${expenseId} by user ${userId}`,
    );

    const expense = await this.findOne(userId, expenseId);

    this.logger.warn(
      `About to PERMANENTLY delete expense: ${JSON.stringify({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
      })}`,
    );

    const result = await this.drizzle.db
      .delete(expenses)
      .where(eq(expenses.id, expenseId))
      .returning();

    if (result.length === 0) {
      this.logger.error(`Failed to hard delete expense ${expenseId}`);
      throw new NotFoundException(
        `Expense ${expenseId} could not be permanently deleted`,
      );
    }

    this.logger.warn(
      `✅ Expense ${expenseId} PERMANENTLY DELETED from database`,
    );

    return {
      success: true,
      message: 'Expense permanently deleted',
    };
  }
}
