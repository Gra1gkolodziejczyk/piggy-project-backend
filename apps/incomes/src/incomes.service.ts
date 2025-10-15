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

  /**
   * Créer un nouveau revenu pour un utilisateur
   * @param userId - ID de l'utilisateur
   * @param dto - Données du revenu à créer
   * @returns Le revenu créé
   * @throws NotFoundException si l'utilisateur n'a pas de compte bancaire
   * @throws BadRequestException si la date de paiement est dans le passé
   */
  async create(userId: string, dto: CreateIncomeDto): Promise<Income> {
    this.logger.log(`Creating income for user ${userId}: ${dto.name}`);

    // Vérifier que l'utilisateur a un compte bancaire
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

    // Valider la date de paiement
    const nextPaymentDate = new Date(dto.nextPaymentDate);
    const now = new Date();

    if (nextPaymentDate < now) {
      throw new BadRequestException(
        'La date de prochaine perception doit être dans le futur',
      );
    }

    // Créer le revenu
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

    this.logger.log(`Income created successfully: ${income.id}`);
    return income;
  }

  /**
   * Récupérer tous les revenus actifs d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Liste des revenus actifs (isActive: true uniquement)
   */
  async findAll(userId: string): Promise<Income[]> {
    this.logger.log(`Fetching all incomes for user ${userId}`);

    // ✅ IMPORTANT : Filtrer sur isActive: true ET isArchived: false
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

    this.logger.log(
      `Found ${userIncomes.length} active incomes for user ${userId}`,
    );
    return userIncomes;
  }

  /**
   * Récupérer un revenu spécifique par son ID
   * @param userId - ID de l'utilisateur
   * @param incomeId - ID du revenu
   * @returns Le revenu trouvé
   * @throws NotFoundException si le revenu n'existe pas
   * @throws ForbiddenException si le revenu n'appartient pas à l'utilisateur
   */
  async findOne(userId: string, incomeId: string): Promise<Income> {
    this.logger.log(`Fetching income ${incomeId} for user ${userId}`);

    const [income] = await this.drizzle.db
      .select()
      .from(incomes)
      .where(eq(incomes.id, incomeId))
      .limit(1);

    if (!income) {
      throw new NotFoundException(`Revenu ${incomeId} introuvable`);
    }

    if (income.userId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to access income ${incomeId} owned by ${income.userId}`,
      );
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'accéder à ce revenu",
      );
    }

    return income;
  }

  /**
   * Récupérer TOUS les revenus (actifs + archivés)
   */
  async findAllIncludingArchived(userId: string): Promise<Income[]> {
    this.logger.log(
      `Fetching ALL incomes (including archived) for user ${userId}`,
    );

    const allIncomes = await this.drizzle.db
      .select()
      .from(incomes)
      .where(eq(incomes.userId, userId));

    this.logger.log(
      `Found ${allIncomes.length} total incomes (active + archived) for user ${userId}`,
    );

    return allIncomes;
  }

  /**
   * Mettre à jour un revenu
   * @param userId - ID de l'utilisateur
   * @param incomeId - ID du revenu à modifier
   * @param dto - Nouvelles données
   * @returns Le revenu mis à jour
   * @throws NotFoundException si le revenu n'existe pas
   * @throws ForbiddenException si le revenu n'appartient pas à l'utilisateur
   * @throws BadRequestException si la date de paiement est invalide
   */
  async update(
    userId: string,
    incomeId: string,
    dto: UpdateIncomeDto,
  ): Promise<Income> {
    this.logger.log(`Updating income ${incomeId} for user ${userId}`);

    // Vérifier que le revenu existe et appartient à l'utilisateur
    await this.findOne(userId, incomeId);

    // Valider la date si elle est fournie
    if (dto.nextPaymentDate) {
      const nextPaymentDate = new Date(dto.nextPaymentDate);
      const now = new Date();

      if (nextPaymentDate < now) {
        throw new BadRequestException(
          'La date de prochaine perception doit être dans le futur',
        );
      }
    }

    // Mettre à jour le revenu
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

    this.logger.log(`Income ${incomeId} updated successfully`);
    return updatedIncome;
  }

  /**
   * Supprimer un revenu (soft delete)
   * @param userId - ID de l'utilisateur
   * @param incomeId - ID du revenu à supprimer
   * @returns Confirmation de suppression
   */
  async delete(
    userId: string,
    incomeId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Soft deleting income ${incomeId} for user ${userId}`);

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

    this.logger.log(`Income ${incomeId} soft deleted successfully`);

    return {
      success: true,
      message: 'Income archived successfully',
    };
  }

  /**
   * Supprimer DÉFINITIVEMENT un revenu (hard delete)
   * ⚠️ ATTENTION : Cette action est IRRÉVERSIBLE
   *
   * @param userId - ID de l'utilisateur
   * @param incomeId - ID du revenu à supprimer définitivement
   * @returns Confirmation de suppression définitive
   *
   * @throws NotFoundException si le revenu n'existe pas
   * @throws ForbiddenException si le revenu n'appartient pas à l'utilisateur
   *
   * @remarks
   * Cette méthode supprime physiquement le revenu de la base de données.
   * Utilisée pour le droit à l'oubli (RGPD Article 17).
   * La suppression est irréversible et toutes les transactions liées
   * perdront leur référence vers ce revenu (set null via cascade).
   */
  async hardDelete(
    userId: string,
    incomeId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.warn(
      `⚠️ HARD DELETE requested for income ${incomeId} by user ${userId}`,
    );

    const income = await this.findOne(userId, incomeId);

    this.logger.warn(
      `About to PERMANENTLY delete income: ${JSON.stringify({
        id: income.id,
        name: income.name,
        amount: income.amount,
      })}`,
    );

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

    this.logger.warn(`✅ Income ${incomeId} PERMANENTLY DELETED from database`);

    return {
      success: true,
      message: 'Income permanently deleted',
    };
  }
}
