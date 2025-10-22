import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: "Nom complet de l'utilisateur",
    example: 'Jean Dupont',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Adresse email (doit être unique)',
    example: 'jean.dupont@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({
    description: "Âge de l'utilisateur",
    example: 30,
    minimum: 18,
    maximum: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone (format international)',
    example: '+33612345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Numéro de téléphone invalide (format international requis)',
  })
  @MaxLength(50)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: "URL de l'image de profil",
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({
    description: 'Code langue (ISO 639-1)',
    example: 'fr',
    default: 'fr',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}$/, { message: 'Code langue invalide (ex: fr, en)' })
  @MaxLength(10)
  lang?: string;

  @ApiPropertyOptional({
    description: 'Activation des notifications par email',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  @ApiPropertyOptional({
    description: 'Activation des notifications par SMS',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  smsNotification?: boolean;
}
