import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { BanksService } from './banks.service';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';
import { GetCurrentUserId } from '@app/contracts/authentication/decorators/get-current-user-id.decorator';
import {
  BankResponseDto,
  UpdateBalanceDto,
  UpdateCurrencyDto,
} from '@app/contracts/banks/dto';

@ApiTags('Banks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer mes informations bancaires',
    description:
      'Retourne le solde actuel et la devise du compte bancaire virtuel de l\'utilisateur authentifié.',
  })
  @ApiResponse({
    status: 200,
    description: 'Informations bancaires récupérées avec succès',
    type: BankResponseDto,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      balance: '1250.50',
      currency: 'EUR',
      lastUpdatedAt: '2025-10-19T14:30:00Z',
      createdAt: '2025-01-01T00:00:00Z',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT manquant ou invalide',
  })
  @ApiResponse({
    status: 404,
    description: 'Compte bancaire non trouvé',
  })
  getBank(@GetCurrentUserId() userId: string): Observable<BankResponseDto> {
    return this.banksService.getBank(userId);
  }

  @Patch('balance/add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ajouter un montant à ma banque',
    description:
      'Augmente le solde du compte bancaire d\'un montant spécifié. Cette opération crée une transaction de traçabilité.',
  })
  @ApiBody({
    type: UpdateBalanceDto,
    description: 'Montant à ajouter au solde',
    examples: {
      deposit: {
        summary: 'Dépôt simple',
        value: {
          amount: 500.0,
          description: 'Dépôt en espèces',
        },
      },
      correction: {
        summary: 'Correction de solde',
        value: {
          amount: 1250.75,
          description: 'Ajustement suite à erreur de saisie',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Solde augmenté avec succès',
    type: BankResponseDto,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      balance: '1750.50',
      currency: 'EUR',
      lastUpdatedAt: '2025-10-19T15:00:00Z',
      createdAt: '2025-01-01T00:00:00Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Montant invalide - Doit être un nombre positif',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Compte bancaire non trouvé',
  })
  addBalance(
    @GetCurrentUserId() userId: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ): Observable<BankResponseDto> {
    return this.banksService.addBalance(userId, updateBalanceDto);
  }

  @Patch('balance/subtract')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retirer un montant de ma banque',
    description:
      'Diminue le solde du compte bancaire d\'un montant spécifié. Cette opération crée une transaction de traçabilité.',
  })
  @ApiBody({
    type: UpdateBalanceDto,
    description: 'Montant à soustraire du solde',
    examples: {
      withdrawal: {
        summary: 'Retrait simple',
        value: {
          amount: 200.0,
          description: 'Retrait en espèces',
        },
      },
      correction: {
        summary: 'Correction de solde',
        value: {
          amount: 50.0,
          description: 'Ajustement suite à double saisie',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Solde diminué avec succès',
    type: BankResponseDto,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      balance: '1550.50',
      currency: 'EUR',
      lastUpdatedAt: '2025-10-19T15:15:00Z',
      createdAt: '2025-01-01T00:00:00Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Montant invalide - Doit être un nombre positif',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Compte bancaire non trouvé',
  })
  subtractBalance(
    @GetCurrentUserId() userId: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ): Observable<BankResponseDto> {
    return this.banksService.subtractBalance(userId, updateBalanceDto);
  }


  @Patch('currency')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Modifier la devise de ma banque',
    description:
      'Change la devise du compte bancaire. ⚠️ Ne convertit pas automatiquement le solde existant.',
  })
  @ApiBody({
    type: UpdateCurrencyDto,
    description: 'Nouvelle devise (code ISO 4217 à 3 lettres)',
    examples: {
      euro: {
        summary: 'Passer en Euro',
        value: { currency: 'EUR' },
      },
      dollar: {
        summary: 'Passer en Dollar US',
        value: { currency: 'USD' },
      },
      pound: {
        summary: 'Passer en Livre Sterling',
        value: { currency: 'GBP' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Devise modifiée avec succès',
    type: BankResponseDto,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      balance: '1550.50',
      currency: 'USD',
      lastUpdatedAt: '2025-10-19T15:30:00Z',
      createdAt: '2025-01-01T00:00:00Z',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Code devise invalide - Doit être un code ISO 4217 valide (3 lettres majuscules)',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Compte bancaire non trouvé',
  })
  updateCurrency(
    @GetCurrentUserId() userId: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ): Observable<BankResponseDto> {
    return this.banksService.updateCurrency(userId, updateCurrencyDto);
  }
}
