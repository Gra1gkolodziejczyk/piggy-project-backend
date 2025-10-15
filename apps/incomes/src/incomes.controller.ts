import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IncomesService } from './incomes.service';
import { INCOMES_PATTERNS } from '@app/contracts/incomes/incomes.pattern';
import { CreateIncomeDto } from '@app/contracts/incomes/dto/create-income.dto';
import { UpdateIncomeDto } from '@app/contracts/incomes/dto/update-income.dto';

/**
 * Controller du microservice Incomes
 * Gère les revenus des utilisateurs (salaire, aides sociales, etc.)
 *
 * @remarks
 * Ce controller écoute les messages TCP envoyés par l'API Gateway
 * et délègue le traitement au IncomesService.
 *
 * Tous les revenus sont liés à un utilisateur via son userId.
 * Les revenus peuvent être récurrents (mensuels, hebdo) ou ponctuels.
 */
@Controller()
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  /**
   * Créer un nouveau revenu
   *
   * @param payload - Contient userId et dto (données du revenu)
   * @returns Le revenu créé
   *
   * @example
   * ```typescript
   * {
   *   userId: "123e4567-e89b-12d3-a456-426614174000",
   *   dto: {
   *     name: "Salaire mensuel",
   *     type: "salary",
   *     amount: 2500.00,
   *     frequency: "monthly",
   *     nextPaymentDate: "2025-11-25T00:00:00.000Z",
   *     isRecurring: true
   *   }
   * }
   * ```
   *
   * @throws NotFoundException - Si l'utilisateur n'a pas de compte bancaire
   * @throws BadRequestException - Si la date de paiement est dans le passé
   */
  @MessagePattern(INCOMES_PATTERNS.CREATE)
  create(@Payload() payload: { userId: string; dto: CreateIncomeDto }) {
    return this.incomesService.create(payload.userId, payload.dto);
  }

  /**
   * Récupérer tous les revenus d'un utilisateur
   *
   * @param userId - ID de l'utilisateur
   * @returns Liste de tous les revenus actifs de l'utilisateur
   *
   * @remarks
   * Seuls les revenus actifs (isActive: true) sont retournés.
   * Les revenus archivés ne sont pas inclus.
   */
  @MessagePattern(INCOMES_PATTERNS.FIND_ALL)
  findAll(@Payload() userId: string) {
    return this.incomesService.findAll(userId);
  }

  /**
   * Récupérer un revenu spécifique par son ID
   *
   * @param payload - Contient userId et incomeId
   * @returns Le revenu demandé
   *
   * @throws NotFoundException - Si le revenu n'existe pas
   * @throws ForbiddenException - Si le revenu n'appartient pas à l'utilisateur
   */
  @MessagePattern(INCOMES_PATTERNS.FIND_ONE)
  findOne(@Payload() payload: { userId: string; incomeId: string }) {
    return this.incomesService.findOne(payload.userId, payload.incomeId);
  }

  /**
   * Mettre à jour un revenu
   *
   * @param payload - Contient userId, incomeId et dto (nouvelles données)
   * @returns Le revenu mis à jour
   * @remarks
   * Tous les champs sont optionnels dans UpdateIncomeDto.
   * Seuls les champs fournis seront mis à jour.
   *
   * @throws NotFoundException - Si le revenu n'existe pas
   * @throws ForbiddenException - Si le revenu n'appartient pas à l'utilisateur
   * @throws BadRequestException - Si la date de paiement est invalide
   */
  @MessagePattern(INCOMES_PATTERNS.UPDATE)
  update(
    @Payload()
    payload: {
      userId: string;
      incomeId: string;
      dto: UpdateIncomeDto;
    },
  ) {
    return this.incomesService.update(
      payload.userId,
      payload.incomeId,
      payload.dto,
    );
  }

  /**
   * Supprimer un revenu (soft delete)
   */
  @MessagePattern(INCOMES_PATTERNS.DELETE)
  delete(@Payload() payload: { userId: string; incomeId: string }) {
    return this.incomesService.delete(payload.userId, payload.incomeId);
  }

  /**
   * Supprimer DÉFINITIVEMENT un revenu (hard delete)
   *
   * @remarks
   * ⚠️ ATTENTION : Suppression physique irréversible
   * À utiliser uniquement pour le droit à l'oubli (RGPD)
   */
  @MessagePattern(INCOMES_PATTERNS.HARD_DELETE)
  hardDelete(@Payload() payload: { userId: string; incomeId: string }) {
    return this.incomesService.hardDelete(payload.userId, payload.incomeId);
  }
}
