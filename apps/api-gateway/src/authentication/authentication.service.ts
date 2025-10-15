import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SignInDto } from '@app/contracts/authentication/dto/signin.dto';
import { SignUpDto } from '@app/contracts/authentication/dto/signup.dto';
import { AUTHENTICATION_PATTERNS } from '@app/contracts/authentication/authentication.pattern';
import { AUTHENTICATION } from '@app/contracts/authentication/authentication.client';

@Injectable()
export class AuthenticationService {
  constructor(@Inject(AUTHENTICATION) private readonly client: ClientProxy) {}

  signIn(loginDto: SignInDto) {
    return this.client.send(AUTHENTICATION_PATTERNS.LOGIN, loginDto);
  }

  signUp(registerDto: SignUpDto) {
    return this.client.send(AUTHENTICATION_PATTERNS.REGISTER, registerDto);
  }

  signOut(userId: string) {
    return this.client.send(AUTHENTICATION_PATTERNS.LOGOUT, userId);
  }
}
