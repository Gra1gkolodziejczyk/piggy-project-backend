import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * @dto FindAllExpensesQueryDto
 * @description DTO pour les paramètres de requête lors de la récupération des dépenses
 *
 * Permet de filtrer et paginer les résultats
 */
export class FindAllExpensesQueryDto {
  @ApiPropertyOptional({
    description: 'Numéro de la page',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filtrer par catégorie',
    example: 'food',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par fréquence',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'],
    example: 'monthly',
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'])
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';

  @ApiPropertyOptional({
    description: 'Filtrer par date de début',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par date de fin',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Inclure les dépenses archivées',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeArchived?: boolean;
}
