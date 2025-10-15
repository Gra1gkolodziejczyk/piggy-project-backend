import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { USERS_PATTERNS } from '@app/contracts/users/users.pattern';
import { UpdateUserDto } from '@app/contracts/users/dto/updateUser.dto';
import { User } from '@app/contracts/database/schema';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_PATTERNS.FIND_ONE)
  findUserById(@Payload() id: string): Promise<User> {
    return this.usersService.findUserById(id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_USER)
  updateUser(
    @Payload() payload: { id: string; dto: UpdateUserDto },
  ): Promise<User> {
    const { id, dto } = payload;
    return this.usersService.updateUserById(id, dto);
  }

  @MessagePattern(USERS_PATTERNS.DELETE)
  deleteUserById(@Payload() id: string): Promise<void> {
    return this.usersService.deleteUserById(id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_PASSWORD)
  updateUserPassword(
    @Payload() payload: { id: string; password: string },
  ): Promise<{ id: string; userId: string; updatedAt: Date }> {
    const { id, password } = payload;
    return this.usersService.updateUserPasswordById(id, password);
  }
}
