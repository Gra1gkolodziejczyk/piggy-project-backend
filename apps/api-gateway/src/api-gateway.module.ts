import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { IncomesModule } from './incomes/incomes.module';

@Module({
  imports: [UsersModule, AuthenticationModule, IncomesModule],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
