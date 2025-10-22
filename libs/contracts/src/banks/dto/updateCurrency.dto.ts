import { IsString, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UpdateCurrencyDto {
  @ApiProperty({
    description: 'Code devise ISO 4217 (3 lettres majuscules)',
    example: 'USD',
    pattern: '/^[A-Z]{3}$/',
    examples: ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD'],
  })
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message:
      'La devise doit être un code ISO 4217 valide (3 lettres majuscules)',
  })
  currency: string;
}
