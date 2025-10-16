import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [UsersModule, AuthenticationModule, IncomesModule, ExpensesModule],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
