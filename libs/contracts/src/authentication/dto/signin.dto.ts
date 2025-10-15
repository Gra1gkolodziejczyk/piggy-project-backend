import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class SignInDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'user@example.com',
    format: 'email',
    minLength: 5,
    maxLength: 255,
  })
  @IsEmail({}, { message: "L'email doit être valide" })
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description:
      'Mot de passe (minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre)',
    example: 'Password123!',
    minLength: 8,
    maxLength: 100,
    format: 'password',
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;
}
