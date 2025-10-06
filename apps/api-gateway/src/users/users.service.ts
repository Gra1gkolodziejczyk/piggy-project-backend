import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from '@app/contracts/users/updateUser.dto';
import { USERS_PATTERNS } from '@app/contracts/users/users.pattern';
import { ClientProxy } from '@nestjs/microservices';
import { USERS } from '@app/contracts/users/users.client';

@Injectable()
export class UsersService {
  constructor(@Inject(USERS) private readonly client: ClientProxy) {}

  findUserById(id: string) {
    return this.client.send(USERS_PATTERNS.FIND_ONE, id);
  }

  async updateUserById(dto: UpdateUserDto, id: string) {
    return this.client.send(USERS_PATTERNS.UPDATE_USER, { dto, id });
  }

  deleteUserById(id: string) {
    return this.client.send(USERS_PATTERNS.DELETE, id);
  }

  updateUserPasswordById(id: string, password: string) {
    return this.client.send(USERS_PATTERNS.UPDATE_PASSWORD, { id, password });
  }
}
