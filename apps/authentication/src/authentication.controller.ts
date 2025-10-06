import { Controller, Post, Body } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { MessagePattern } from '@nestjs/microservices';
import { Tokens } from '@app/contracts/authentication/token.type';
import { LoginDto } from '@app/contracts/authentication/login.dto';
import { RegisterDto } from '@app/contracts/authentication/register.dto';
import { AUTHENTICATION_PATTERNS } from '@app/contracts/authentication/authentication.pattern';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/signin')
  @MessagePattern(AUTHENTICATION_PATTERNS.LOGIN)
  signIn(@Body() dto: LoginDto): Promise<Tokens> {
    return this.authenticationService.signIn(dto);
  }

  @Post('/signup')
  @MessagePattern(AUTHENTICATION_PATTERNS.REGISTER)
  signUp(@Body() dto: RegisterDto): Promise<Tokens> {
    return this.authenticationService.signUp(dto);
  }

  @Post('/signout')
  @MessagePattern(AUTHENTICATION_PATTERNS.LOGOUT)
  signOut(@Body('userId') userId: string) {
    return this.authenticationService.signOut(userId);
  }
}
