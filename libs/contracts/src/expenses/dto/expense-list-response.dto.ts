import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponseDto } from './expense-response.dto';

export class ExpenseListResponseDto {
  @ApiProperty({
    description: 'Liste des dépenses',
    type: [ExpenseResponseDto],
  })
  data: ExpenseResponseDto[];

  @ApiProperty({
    description: 'Métadonnées de pagination',
    example: {
      total: 42,
      page: 1,
      limit: 20,
      totalPages: 3,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
