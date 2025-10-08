import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: "Nom de l'utilisateur",
    example: 'Jean Dupont',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'jean.dupont@example.com',
    required: false,
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (minimum 6 caractères)',
    example: 'Password123!',
    required: false,
    minLength: 6,
    maxLength: 100,
    format: 'password',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;
}
