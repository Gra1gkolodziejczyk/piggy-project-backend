import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateBankDto {
  @ApiProperty({
    description: "ID de l'utilisateur",
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Solde initial (par défaut 0.00)',
    example: '0.00',
    default: '0.00',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  balance?: number;

  @ApiPropertyOptional({
    description: 'Devise initiale (par défaut EUR)',
    example: 'EUR',
    default: 'EUR',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;
}
