import { Injectable, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Tokens } from '@app/contracts/authentication/token.type';
import { LoginDto } from '@app/contracts/authentication/login.dto';
import { RegisterDto } from '@app/contracts/authentication/register.dto';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from '@app/contracts/drizzle/drizzle.service';
import { users, accounts, User } from '@app/contracts/database/schema';

@Injectable()
export class AuthenticationService {
  constructor(
    private drizzle: DrizzleService,
    private jwtService: JwtService,
  ) {}

  async signIn(dto: LoginDto): Promise<Tokens> {
    // Récupérer l'utilisateur avec son compte
    const result = await this.drizzle.db
      .select({
        id: users.id,
        email: users.email,
        password: accounts.password,
      })
      .from(users)
      .leftJoin(accounts, eq(users.id, accounts.userId))
      .where(eq(users.email, dto.email))
      .limit(1);

    const user = result[0];

    if (!user || !user.password) {
      throw new ForbiddenException('Invalid credentials');
    }

    const passwordMatches = bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async signUp(dto: RegisterDto): Promise<Tokens> {
    const passwordHash = await this.hashData(dto.password);

    try {
      const result = await this.drizzle.db.transaction(async (tx) => {
        // 1) Créer l'utilisateur pour récupérer son id
        const [user] = await tx
          .insert(users)
          .values({
            name: dto.name,
            email: dto.email,
          })
          .returning({
            id: users.id,
            email: users.email,
          });
        const tokens = await this.getTokens(user.id, user.email);
        const refreshTokenHash = await this.hashData(tokens.refresh_token);
        const refreshTokenExpiresAt = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        await tx.insert(accounts).values({
          userId: user.id,
          password: passwordHash,
          refreshToken: refreshTokenHash,
          refreshTokenExpiresAt,
        });
        return tokens;
      });

      return result;
    } catch (e: any) {
      if (e.code === '23505' && e.constraint?.includes('email')) {
        throw new ForbiddenException('Email already registered');
      }
      throw e;
    }
  }

  async refreshToken(userId: string, refreshToken: string): Promise<Tokens> {
    const result = await this.drizzle.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    const account = result[0];

    if (!account || !account.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const refreshTokenMatch = bcrypt.compare(
      refreshToken,
      account.refreshToken,
    );

    if (!refreshTokenMatch) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.findUserById(userId);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async signOut(userId: string): Promise<void> {
    await this.drizzle.db
      .update(accounts)
      .set({
        refreshToken: null,
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, userId));
  }

  async findUserById(userId: string): Promise<User> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = result[0];

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    return user;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await this.hashData(refreshToken);

    await this.drizzle.db
      .update(accounts)
      .set({
        refreshToken: hash,
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, userId));
  }

  async hashData(data: string): Promise<string> {
    if (!data) {
      throw new Error('Data to hash cannot be empty.');
    }
    const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS));
    return bcrypt.hash(data, salt);
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '24h' }),
      this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '7d' }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateAccessToken(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify(token);

      const result = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, decoded.sub))
        .limit(1);

      const user = result[0];

      if (!user) {
        throw new ForbiddenException('Invalid token or user not found');
      }

      return user;
    } catch (error) {
      throw new ForbiddenException('Invalid or expired token');
    }
  }

  async getUserById(userId: string): Promise<User> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = result[0];

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  }
}
