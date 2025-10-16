import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ExpenseFrequency } from './create-expense.dto';

export class UpdateExpenseDto {
  @ApiPropertyOptional({
    description: 'Nom de la dépense',
    example: 'Loyer (nouveau prix)',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Loyer mensuel appartement centre-ville',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Montant',
    example: 900.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Fréquence',
    enum: ExpenseFrequency,
  })
  @IsOptional()
  @IsEnum(ExpenseFrequency)
  frequency?: ExpenseFrequency;

  @ApiPropertyOptional({
    description: 'Jour du mois (1-31)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @ApiPropertyOptional({
    description: 'Activer/Désactiver la dépense',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
