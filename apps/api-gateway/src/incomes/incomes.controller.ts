import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from '@app/contracts/incomes/dto/create-income.dto';
import { UpdateIncomeDto } from '@app/contracts/incomes/dto/update-income.dto';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';
import { GetCurrentUserId } from '@app/contracts/authentication/decorators/get-current-user-id.decorator';

/**
 * Controller REST pour la gestion des revenus
 *
 * @remarks
 * Toutes les routes nécessitent une authentification JWT.
 * L'utilisateur ne peut accéder qu'à ses propres revenus.
 */
@ApiTags('Incomes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  /**
   * Créer un nouveau revenu
   *
   * @remarks
   * Permet à un utilisateur connecté d'ajouter un nouveau revenu.
   * Le revenu peut être récurrent (salaire mensuel) ou ponctuel (prime).
   *
   * @param userId - ID de l'utilisateur (extrait du token JWT)
   * @param dto - Données du revenu à créer
   * @returns Le revenu créé avec son ID
   */
  @Post()
  @ApiOperation({
    summary: 'Créer un nouveau revenu',
    description:
      "Permet d'ajouter un nouveau revenu (salaire, aide sociale, prime, etc.). Le revenu sera automatiquement lié à votre compte bancaire.",
  })
  @ApiBody({ type: CreateIncomeDto })
  @ApiResponse({
    status: 201,
    description: 'Revenu créé avec succès',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        userId: {
          type: 'string',
          format: 'uuid',
        },
        name: {
          type: 'string',
          example: 'Salaire mensuel',
        },
        type: {
          type: 'string',
          enum: ['salary', 'social_aid', 'bonus', 'investment', 'other'],
          example: 'salary',
        },
        amount: {
          type: 'string',
          example: '2500.00',
        },
        frequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'],
          example: 'monthly',
        },
        nextPaymentDate: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-25T00:00:00.000Z',
        },
        isRecurring: {
          type: 'boolean',
          example: true,
        },
        isActive: {
          type: 'boolean',
          example: true,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Données invalides - Vérifier le format des champs ou la date de paiement',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiResponse({
    status: 404,
    description:
      "Compte bancaire introuvable - Créer un compte bancaire d'abord",
  })
  create(@GetCurrentUserId() userId: string, @Body() dto: CreateIncomeDto) {
    return this.incomesService.create(userId, dto);
  }

  /**
   * Récupérer tous mes revenus
   *
   * @remarks
   * Retourne la liste complète des revenus actifs de l'utilisateur connecté.
   * Les revenus archivés ne sont pas inclus dans la réponse.
   *
   * @param userId - ID de l'utilisateur (extrait du token JWT)
   * @returns Liste des revenus actifs
   */
  @Get()
  @ApiOperation({
    summary: 'Récupérer tous mes revenus',
    description:
      'Retourne la liste de tous vos revenus actifs (salaire, aides, primes, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des revenus récupérée avec succès',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Salaire mensuel' },
          type: { type: 'string', example: 'salary' },
          amount: { type: 'string', example: '2500.00' },
          frequency: { type: 'string', example: 'monthly' },
          nextPaymentDate: {
            type: 'string',
            format: 'date-time',
          },
          isRecurring: { type: 'boolean', example: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  findAll(@GetCurrentUserId() userId: string) {
    return this.incomesService.findAll(userId);
  }

  /**
   * Récupérer un revenu spécifique
   *
   * @remarks
   * Retourne les détails d'un revenu spécifique appartenant à l'utilisateur.
   * Utile pour afficher le détail d'un revenu ou vérifier ses informations avant modification.
   *
   * @param userId - ID de l'utilisateur (extrait du token JWT)
   * @param incomeId - ID du revenu à récupérer
   * @returns Les détails du revenu
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Récupérer un revenu par son ID',
    description:
      "Retourne les détails d'un revenu spécifique. Vous ne pouvez accéder qu'à vos propres revenus.",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du revenu (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenu trouvé',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Salaire mensuel' },
        type: { type: 'string', example: 'salary' },
        amount: { type: 'string', example: '2500.00' },
        frequency: { type: 'string', example: 'monthly' },
        description: { type: 'string' },
        nextPaymentDate: { type: 'string', format: 'date-time' },
        isRecurring: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Ce revenu ne vous appartient pas',
  })
  @ApiResponse({
    status: 404,
    description: 'Revenu introuvable',
  })
  findOne(
    @GetCurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) incomeId: string,
  ) {
    return this.incomesService.findOne(userId, incomeId);
  }

  /**
   * Modifier un revenu
   *
   * @remarks
   * Permet de mettre à jour les informations d'un revenu existant.
   * Tous les champs sont optionnels — seuls les champs fournis seront mis à jour.
   *
   * @param userId - ID de l'utilisateur (extrait du token JWT)
   * @param incomeId - ID du revenu à modifier
   * @param dto - Nouvelles données (tous les champs sont optionnels)
   * @returns Le revenu mis à jour
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un revenu',
    description:
      "Met à jour les informations d'un revenu. Tous les champs sont optionnels - seuls les champs fournis seront modifiés.",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du revenu à modifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateIncomeDto })
  @ApiResponse({
    status: 200,
    description: 'Revenu modifié avec succès',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Salaire mensuel (augmenté)' },
        amount: { type: 'string', example: '2700.00' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Ce revenu ne vous appartient pas',
  })
  @ApiResponse({
    status: 404,
    description: 'Revenu introuvable',
  })
  update(
    @GetCurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) incomeId: string,
    @Body() dto: UpdateIncomeDto,
  ) {
    return this.incomesService.update(userId, incomeId, dto);
  }

  /**
   * Supprimer un revenu (soft delete - archivage)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archiver un revenu (soft delete)',
    description:
      "Archive un revenu. Le revenu reste en base de données mais n'apparaît plus dans la liste. " +
      'Cette action peut être annulée. Pour une suppression définitive, utilisez DELETE /incomes/:id/permanent',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du revenu à archiver (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenu archivé avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Income archived successfully' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT invalide ou manquant',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Ce revenu ne vous appartient pas',
  })
  @ApiResponse({
    status: 404,
    description: 'Revenu introuvable',
  })
  delete(
    @GetCurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) incomeId: string,
  ) {
    return this.incomesService.delete(userId, incomeId);
  }

  /**
   * Supprimer DÉFINITIVEMENT un revenu (hard delete)
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '  Supprimer DÉFINITIVEMENT un revenu (RGPD)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du revenu à supprimer définitivement (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenu supprimé définitivement',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Income permanently deleted',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT invalide ou manquant',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Ce revenu ne vous appartient pas',
  })
  @ApiResponse({
    status: 404,
    description: 'Revenu introuvable',
  })
  hardDelete(
    @GetCurrentUserId() userId: string,
    @Param('id', new ParseUUIDPipe()) incomeId: string,
  ) {
    return this.incomesService.hardDelete(userId, incomeId);
  }
}
