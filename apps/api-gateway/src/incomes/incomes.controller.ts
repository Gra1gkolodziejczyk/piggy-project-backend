import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IncomesService } from './incomes.service';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';

@ApiTags('Incomes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}
}
