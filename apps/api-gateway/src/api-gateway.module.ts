import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';

@Module({
  imports: [UsersModule, AuthenticationModule],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
