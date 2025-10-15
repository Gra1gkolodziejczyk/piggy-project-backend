import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DrizzleModule.forRoot(),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
