import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BanksService } from './banks.service';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';

@ApiTags('Banks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}
}
