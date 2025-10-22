import { AuthenticationModule } from './authentication/authentication.module';
import { BanksModule } from './banks/banks.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomesModule } from './incomes/incomes.module';
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    AuthenticationModule,
    IncomesModule,
    ExpensesModule,
    BanksModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
