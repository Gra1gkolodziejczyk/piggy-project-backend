import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class UpdateBalanceDto {
  @ApiProperty({
    description: 'Montant à ajouter ou soustraire',
    example: 500.0,
    minimum: 0.01,
    type: Number,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant doit avoir au maximum 2 décimales' },
  )
  @IsPositive({ message: 'Le montant doit être supérieur à 0' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Description optionnelle de l\'opération (pour traçabilité)',
    example: 'Dépôt en espèces',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La description ne peut pas dépasser 500 caractères',
  })
  description?: string;
}
