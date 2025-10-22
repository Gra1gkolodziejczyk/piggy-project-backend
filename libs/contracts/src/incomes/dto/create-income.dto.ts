import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum IncomeType {
  SALARY = 'salary',
  SOCIAL_AID = 'social_aid',
  BONUS = 'bonus',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

export enum IncomeFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  ONCE = 'once',
}

export class CreateIncomeDto {
  @ApiProperty({
    description: 'Nom du revenu',
    example: 'Salaire mensuel',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Type de revenu',
    enum: IncomeType,
    example: IncomeType.SALARY,
    enumName: 'IncomeType',
  })
  @IsEnum(IncomeType, {
    message:
      'Le type doit être: salary, social_aid, bonus, investment ou other',
  })
  type: IncomeType;

  @ApiProperty({
    description: 'Montant du revenu en euros',
    example: 2500.0,
    minimum: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant doit être un nombre avec maximum 2 décimales' },
  )
  @Min(0, { message: 'Le montant doit être positif' })
  amount: number;

  @ApiProperty({
    description: 'Fréquence du revenu',
    enum: IncomeFrequency,
    example: IncomeFrequency.MONTHLY,
    enumName: 'IncomeFrequency',
  })
  @IsEnum(IncomeFrequency, {
    message:
      'La fréquence doit être: daily, weekly, monthly, quarterly, yearly ou once',
  })
  frequency: IncomeFrequency;

  @ApiProperty({
    description: 'Date de la prochaine perception (format ISO 8601)',
    example: '2025-11-25T00:00:00.000Z',
  })
  @IsDateString(
    {},
    {
      message:
        'La date doit être au format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
    },
  )
  nextPaymentDate: string;

  @ApiProperty({
    description: 'Le revenu est-il récurrent ou ponctuel ?',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'isRecurring doit être true ou false' })
  isRecurring: boolean;

  @ApiPropertyOptional({
    description: 'Description détaillée du revenu',
    example: 'Salaire NET de mon emploi principal chez XYZ Corp',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
