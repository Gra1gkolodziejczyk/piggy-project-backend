import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SplitPercentageDto {
  @ApiProperty({
    description: 'Nom du participant',
    example: 'Alice',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Pourcentage de la dépense (entre 0.01 et 100)',
    example: 50.0,
    minimum: 0.01,
    maximum: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(100)
  percentage: number;
}

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Nom de la dépense',
    example: 'Restaurant entre potes',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Icône de la dépense (emoji ou nom)',
    example: '🍕',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Catégorie de la dépense',
    example: 'food',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la dépense',
    example: 'Pizza 4 fromages + desserts',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Montant total de la dépense (doit être positif)',
    example: 120.5,
    minimum: 0.01,
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    description: 'Fréquence de récurrence de la dépense',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'],
    default: 'once',
    example: 'monthly',
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'])
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';

  @ApiPropertyOptional({
    description: 'Indique si la dépense est récurrente',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Date de la prochaine occurrence (pour les dépenses récurrentes)',
    example: '2025-11-01T00:00:00Z',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  nextPaymentDate?: string;

  @ApiPropertyOptional({
    description: 'Répartition de la dépense entre participants (la somme doit être 100%)',
    type: [SplitPercentageDto],
    example: [
      { name: 'Alice', percentage: 33.33 },
      { name: 'Bob', percentage: 33.33 },
      { name: 'Charlie', percentage: 33.34 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitPercentageDto)
  splitPercentages?: SplitPercentageDto[];
}
