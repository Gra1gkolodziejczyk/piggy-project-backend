import { Controller } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AUTHENTICATION_PATTERNS } from '@app/contracts/authentication/authentication.pattern';
import { SignUpDto } from '@app/contracts/authentication/dto/signup.dto';
import { SignInDto } from '@app/contracts/authentication/dto/signin.dto';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern(AUTHENTICATION_PATTERNS.SIGN_UP)
  async signUp(@Payload() dto: SignUpDto) {
    return this.authenticationService.signUp(dto);
  }

  @MessagePattern(AUTHENTICATION_PATTERNS.SIGN_IN)
  async signIn(@Payload() dto: SignInDto) {
    return this.authenticationService.signIn(dto);
  }

  @MessagePattern(AUTHENTICATION_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() refreshToken: string) {
    return this.authenticationService.refreshToken(refreshToken);
  }

  @MessagePattern(AUTHENTICATION_PATTERNS.SIGN_OUT)
  async signOut(@Payload() userId: string) {
    return this.authenticationService.signOut(userId);
  }
}
