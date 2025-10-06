import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '@app/contracts/users/updateUser.dto';
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

  async updateUserById(dto: UpdateUserDto, id: string): Promise<User> {
    const [user] = await this.drizzle.db
      .update(users)
      .set({
        ...dto,
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Hard delete (RGPD - droit à l'effacement total)
  async deleteUserById(id: string): Promise<void> {
    const result = await this.drizzle.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!result.length) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // L'Account sera automatiquement supprimé grâce au onDelete: 'cascade'
  }

  // Soft delete (recommandé pour RGPD - conservation des logs)
  async softDeleteUserById(id: string): Promise<void> {
    // Si tu as un champ isActive ou deletedAt dans ton schema
    const [user] = await this.drizzle.db
      .update(users)
      .set({
        isActive: false,
        // deletedAt: new Date(), // si tu ajoutes ce champ
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateUserPasswordById(
    id: string,
    password: string,
  ): Promise<{ id: string; userId: string; updatedAt: Date }> {
    const hashed = await bcrypt.hash(password, 10);

    const [account] = await this.drizzle.db
      .update(accounts)
      .set({
        password: hashed,
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, id))
      .returning({
        id: accounts.id,
        userId: accounts.userId,
        updatedAt: accounts.updatedAt,
      });

    if (!account) {
      throw new NotFoundException(`Account for user ID ${id} not found`);
    }

    return account;
  }

  // Méthodes supplémentaires utiles

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async findAllUsers(includeInactive = false): Promise<User[]> {
    if (includeInactive) {
      return this.drizzle.db.select().from(users);
    }

    return this.drizzle.db.select().from(users).where(eq(users.isActive, true));
  }
}
