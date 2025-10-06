import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '@app/contracts/users/updateUser.dto';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';
import { GetCurrentUser } from '@app/contracts/authentication/decorators/get-current-user.decorator';
import { GetCurrentUserId } from '@app/contracts/authentication/decorators/get-current-user-id.decorator';
import { map } from 'rxjs/operators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMe(@GetCurrentUserId() id: string, @GetCurrentUser() requester: any) {
    return this.usersService.findUserById(id).pipe(
      map((dbUser) => {
        if (!dbUser) {
          throw new NotFoundException(`User ${id} not found`);
        }
        return { user: dbUser, requester };
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUserById(dto, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  updateUserPasswordById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { password: string },
  ) {
    const { password } = body;
    return this.usersService.updateUserPasswordById(id, password);
  }
}
