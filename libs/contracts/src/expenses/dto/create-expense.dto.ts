import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export enum ExpenseFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ONCE = 'once',
}

export class CreateExpenseDto {
  @ApiProperty({
    description: 'ID du budget auquel appartient cette dépense',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'budgetId doit être un UUID valide' })
  budgetId: string;

  @ApiProperty({
    description: 'Nom de la dépense',
    example: 'Loyer',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la dépense',
    example: 'Loyer mensuel pour appartement 3 pièces',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Montant de la dépense en euros',
    example: 850.5,
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant doit être un nombre avec maximum 2 décimales' },
  )
  @Min(0, { message: 'Le montant doit être positif' })
  amount: number;

  @ApiProperty({
    description: 'Fréquence de la dépense',
    enum: ExpenseFrequency,
    example: ExpenseFrequency.MONTHLY,
    enumName: 'ExpenseFrequency',
  })
  @IsEnum(ExpenseFrequency, {
    message:
      'La fréquence doit être: daily, weekly, monthly, quarterly, yearly ou once',
  })
  frequency: ExpenseFrequency;

  @ApiPropertyOptional({
    description: 'Jour du mois pour les dépenses mensuelles (1-31)',
    example: 5,
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Le jour doit être entre 1 et 31' })
  @Max(31, { message: 'Le jour doit être entre 1 et 31' })
  dueDay?: number;
}
