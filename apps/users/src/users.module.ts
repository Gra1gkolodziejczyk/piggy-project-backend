import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule.forRoot()],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
