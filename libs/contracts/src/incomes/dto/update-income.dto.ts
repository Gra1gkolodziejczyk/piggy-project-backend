import { IncomeFrequency, IncomeType } from './create-income.dto';
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

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateIncomeDto {
  @ApiPropertyOptional({
    description: 'Nom du revenu',
    example: 'Salaire mensuel (augmenté)',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Type de revenu',
    enum: IncomeType,
    example: IncomeType.SALARY,
  })
  @IsOptional()
  @IsEnum(IncomeType)
  type?: IncomeType;

  @ApiPropertyOptional({
    description: 'Montant du revenu',
    example: 2700.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Fréquence du revenu',
    enum: IncomeFrequency,
  })
  @IsOptional()
  @IsEnum(IncomeFrequency)
  frequency?: IncomeFrequency;

  @ApiPropertyOptional({
    description: 'Prochaine date de perception',
    example: '2025-12-25T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  nextPaymentDate?: string;

  @ApiPropertyOptional({
    description: 'Revenu récurrent ou non',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Salaire avec augmentation de 5%',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Activer/Désactiver le revenu',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
