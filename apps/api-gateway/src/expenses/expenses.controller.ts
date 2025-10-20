import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';
import { CreateExpenseDto, ExpenseListResponseDto, ExpenseResponseDto, UpdateExpenseDto } from '@app/contracts/expenses/dto';
import { GetCurrentUserId } from '@app/contracts/authentication/decorators';
import { Observable } from 'rxjs';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(
    @GetCurrentUserId() userId: string,
  ): Observable<ExpenseResponseDto[]> {
    return this.expensesService.findAll(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer une dépense par son ID',
    description:
      'Retourne les détails complets d\'une dépense spécifique. L\'utilisateur doit être le propriétaire de la dépense.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la dépense à récupérer',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Dépense récupérée avec succès',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Cette dépense appartient à un autre utilisateur',
  })
  @ApiResponse({
    status: 404,
    description: 'Dépense non trouvée',
  })
  findOne(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Observable<ExpenseResponseDto> {
    return this.expensesService.findOne(userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle dépense',
    description:
      'Crée une dépense associée à l\'utilisateur authentifié. La dépense peut être liée à un budget et/ou une catégorie.',
  })
  @ApiBody({
    type: CreateExpenseDto,
    description: 'Données de la dépense à créer',
    examples: {
      example1: {
        summary: 'Dépense simple',
        value: {
          amount: 45.5,
          description: 'Course alimentaire Carrefour',
          categoryId: 'groceries',
          date: '2025-10-15T14:30:00Z',
          isRecurring: false,
        },
      },
      example2: {
        summary: 'Dépense récurrente liée à un budget',
        value: {
          amount: 80.0,
          description: 'Abonnement salle de sport',
          categoryId: 'fitness',
          budgetId: '123e4567-e89b-12d3-a456-426614174000',
          date: '2025-10-15T00:00:00Z',
          isRecurring: true,
          recurringFrequency: 'monthly',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Dépense créée avec succès',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides - Vérifier les champs requis et leur format',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget ou catégorie référencé(e) non trouvé(e)',
  })
  create(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateExpenseDto,
  ): Observable<ExpenseResponseDto> {
    return this.expensesService.create(userId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier une dépense existante',
    description:
      'Met à jour les champs spécifiés d\'une dépense. Seul le propriétaire peut modifier ses dépenses.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la dépense à modifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateExpenseDto,
    description: 'Champs à mettre à jour (partiel)',
    examples: {
      example1: {
        summary: 'Modification du montant',
        value: {
          amount: 55.75,
        },
      },
      example2: {
        summary: 'Modification complète',
        value: {
          amount: 60.0,
          description: 'Course alimentaire actualisée',
          categoryId: 'groceries',
          date: '2025-10-15T16:00:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Dépense modifiée avec succès',
    type: ExpenseResponseDto,
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
    description: 'Accès interdit - Cette dépense appartient à un autre utilisateur',
  })
  @ApiResponse({
    status: 404,
    description: 'Dépense non trouvée',
  })
  update(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ): Observable<ExpenseResponseDto> {
    return this.expensesService.update(userId, id, updateExpenseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une dépense',
    description:
      'Supprime définitivement une dépense. Cette action est irréversible. Seul le propriétaire peut supprimer ses dépenses.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la dépense à supprimer',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Dépense supprimée avec succès (aucun contenu retourné)',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - Cette dépense appartient à un autre utilisateur',
  })
  @ApiResponse({
    status: 404,
    description: 'Dépense non trouvée',
  })
  remove(
    @GetCurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Observable<void> {
    return this.expensesService.remove(userId, id);
  }
}
