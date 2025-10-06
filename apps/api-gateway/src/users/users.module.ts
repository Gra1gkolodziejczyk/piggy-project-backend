import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USERS } from '@app/contracts/users/users.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_HOST || '127.0.0.1',
          port: Number(process.env.USERS_PORT) || 4000,
        },
      },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
