import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { USERS_PATTERNS } from '@app/contracts/users/users.pattern';
import { UpdateUserDto } from '@app/contracts/users/dto/updateUser.dto';
import { User } from '@app/contracts/database/schema';
import { USERS } from '@app/contracts/users/users.client';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS) private readonly usersClient: ClientProxy,
  ) {}

  findUserById(id: string): Observable<User> {
    return this.usersClient.send(USERS_PATTERNS.FIND_ONE, id);
  }

  updateUserById(id: string, dto: UpdateUserDto): Observable<User> {
    return this.usersClient.send(USERS_PATTERNS.UPDATE_USER, { id, dto });
  }

  deleteUserById(id: string): Observable<void> {
    return this.usersClient.send(USERS_PATTERNS.DELETE, id);
  }

  updateUserPasswordById(
    id: string,
    password: string,
  ): Observable<{ id: string; userId: string; updatedAt: Date }> {
    return this.usersClient.send(USERS_PATTERNS.UPDATE_PASSWORD, {
      id,
      password,
    });
  }
}
