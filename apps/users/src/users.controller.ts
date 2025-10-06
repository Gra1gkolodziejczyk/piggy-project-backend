import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { USERS_PATTERNS } from '@app/contracts/users/users.pattern';
import { UpdateUserDto } from '@app/contracts/users/updateUser.dto';
import { User } from '@app/contracts/database/schema';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_PATTERNS.FIND_ONE)
  findUserById(@Payload() id: string) {
    return this.usersService.findUserById(id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_USER)
  updateUser(
    @Payload() payload: { dto: UpdateUserDto; id: string },
  ): Promise<Omit<User, 'password'>> {
    const { dto, id } = payload;
    return this.usersService.updateUserById(dto, id);
  }

  @MessagePattern(USERS_PATTERNS.DELETE)
  deleteUserById(@Payload() id: string) {
    return this.usersService.deleteUserById(id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_PASSWORD)
  updateUserPassword(@Payload() payload: { id: string; password: string }) {
    const { id, password } = payload;
    return this.usersService.updateUserPasswordById(id, password);
  }
}
