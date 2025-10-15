import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: 'MyNewSecureP@ssw0rd!',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)',
  })
  password: string;
}
