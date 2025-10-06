import { Controller, Post, Body, Param } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from '@app/contracts/authentication/login.dto';
import { RegisterDto } from '@app/contracts/authentication/register.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signin')
  signIn(@Body() dto: LoginDto) {
    return this.authenticationService.signIn(dto);
  }

  @Post('signup')
  signUp(@Body() dto: RegisterDto) {
    return this.authenticationService.signUp(dto);
  }

  @Post('signout')
  signOut(@Param() id: string) {
    return this.authenticationService.signOut(id);
  }
}
