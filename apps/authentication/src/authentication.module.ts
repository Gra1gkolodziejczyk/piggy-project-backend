import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import * as dotenv from 'dotenv';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';

@Module({
  imports: [
    DrizzleModule.forRoot(),
    JwtModule.registerAsync({
      useFactory: () => {
        dotenv.config();
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is not set');
        }
        return {
          secret,
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
