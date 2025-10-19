import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Matches,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class BankResponseDto {
  @ApiProperty({
    description: 'ID unique du compte bancaire',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur propriétaire',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Solde actuel du compte',
    example: '1250.50',
    type: String,
  })
  @IsString()
  balance: string;

  @ApiProperty({
    description: 'Code devise ISO 4217 (3 lettres majuscules)',
    example: 'EUR',
    pattern: '/^[A-Z]{3}$/',
  })
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'La devise doit être un code ISO 4217 valide (3 lettres majuscules)',
  })
  currency: string;

  @ApiProperty({
    description: 'Date de dernière mise à jour du solde ou de la devise',
    example: '2025-10-19T14:30:00Z',
  })
  @IsDateString()
  lastUpdatedAt: Date;

  @ApiProperty({
    description: 'Date de création du compte bancaire',
    example: '2025-01-01T00:00:00Z',
  })
  @IsDateString()
  createdAt: Date;
}
