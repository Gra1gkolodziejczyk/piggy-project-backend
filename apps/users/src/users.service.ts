import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '@app/contracts/users/dto/updateUser.dto';
import { DrizzleService } from '@app/contracts/drizzle/drizzle.service';
import { users, accounts, User } from '@app/contracts/database/schema';

@Injectable()
export class UsersService {
  constructor(private readonly drizzle: DrizzleService) {}


  async findUserById(id: string): Promise<User> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const user = result[0];

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUserById(id: string, dto: UpdateUserDto): Promise<User> {
    // Vérifier que l'utilisateur existe avant de tenter la mise à jour
    await this.findUserById(id);

    const [updatedUser] = await this.drizzle.db
      .update(users)
      .set({
        ...dto,
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }


  async deleteUserById(id: string): Promise<void> {
    const result = await this.drizzle.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!result.length) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * Met à jour le mot de passe d'un utilisateur
   * @throws NotFoundException si le compte n'existe pas
   */
  async updateUserPasswordById(
    userId: string,
    password: string,
  ): Promise<{ id: string; userId: string; updatedAt: Date }> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [account] = await this.drizzle.db
      .update(accounts)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, userId))
      .returning({
        id: accounts.id,
        userId: accounts.userId,
        updatedAt: accounts.updatedAt,
      });

    if (!account) {
      throw new NotFoundException(`Account for user ID ${userId} not found`);
    }

    return account;
  }


  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }
}
