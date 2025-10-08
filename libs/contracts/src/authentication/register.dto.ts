import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: "L'email doit être valide" })
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Mot de passe sécurisé',
    example: 'Password123!',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

  @ApiProperty({
    description: "Nom complet de l'utilisateur",
    example: 'Jean Dupont',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
