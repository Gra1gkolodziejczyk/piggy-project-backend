import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseResponseDto {
  @ApiProperty({
    description: 'ID unique de la dépense',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: "ID de l'utilisateur propriétaire",
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

  @ApiProperty({
    description: 'Nom de la dépense',
    example: 'Restaurant entre potes',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Icône de la dépense',
    example: '🍕',
  })
  icon?: string | null;

  @ApiPropertyOptional({
    description: 'Catégorie de la dépense',
    example: 'food',
  })
  category?: string | null;

  @ApiPropertyOptional({
    description: 'Description de la dépense',
    example: 'Pizza 4 fromages + desserts',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Montant total de la dépense',
    example: '120.50',
    type: String,
  })
  amount: string;

  @ApiProperty({
    description: 'Fréquence de récurrence',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'],
    example: 'monthly',
  })
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';

  @ApiProperty({
    description: 'Indique si la dépense est récurrente',
    example: false,
  })
  isRecurring: boolean;

  @ApiPropertyOptional({
    description: 'Date de la prochaine occurrence',
    example: '2025-11-01T00:00:00Z',
  })
  nextPaymentDate?: Date | null;

  @ApiPropertyOptional({
    description: 'Répartition de la dépense entre participants',
    type: 'array',
    example: [
      { name: 'Alice', percentage: 50 },
      { name: 'Bob', percentage: 50 },
    ],
  })
  splitPercentages?: Array<{ name: string; percentage: number }> | null;

  @ApiProperty({
    description: 'Indique si la dépense est active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indique si la dépense est archivée',
    example: false,
  })
  isArchived: boolean;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-10-15T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2025-10-19T15:30:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: "Date d'archivage (si archivée)",
    example: '2025-10-20T12:00:00Z',
  })
  archivedAt?: Date | null;
}
