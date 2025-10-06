import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTHENTICATION } from '@app/contracts/authentication/authentication.client';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '@app/contracts/authentication/guards';
import { AccessTokenStrategy } from '@app/contracts/authentication/strategies';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      useFactory: () => {
        dotenv.config();
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is not set');
        }
        return { secret };
      },
    }),
    ClientsModule.register([
      {
        name: AUTHENTICATION,
        transport: Transport.TCP,
        options: {
          host: process.env.AUTHENTICATION_HOST || '127.0.0.1',
          port: Number(process.env.AUTHENTICATION_PORT) || 4002,
        },
      },
    ]),
  ],
  providers: [AuthenticationService, AccessTokenStrategy, JwtAuthGuard],
  controllers: [AuthenticationController],
  exports: [PassportModule, JwtModule, JwtAuthGuard],
})
export class AuthenticationModule {}
