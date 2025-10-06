import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from '@app/contracts/authentication/login.dto';
import { RegisterDto } from '@app/contracts/authentication/register.dto';
import { AUTHENTICATION_PATTERNS } from '@app/contracts/authentication/authentication.pattern';
import { AUTHENTICATION } from '@app/contracts/authentication/authentication.client';

@Injectable()
export class AuthenticationService {
  constructor(@Inject(AUTHENTICATION) private readonly client: ClientProxy) {}

  signIn(loginDto: LoginDto) {
    return this.client.send(AUTHENTICATION_PATTERNS.LOGIN, loginDto);
  }

  signUp(registerDto: RegisterDto) {
    return this.client.send(AUTHENTICATION_PATTERNS.REGISTER, registerDto);
  }

  signOut(userId: string) {
    return this.client.send(AUTHENTICATION_PATTERNS.LOGOUT, userId);
  }
}
