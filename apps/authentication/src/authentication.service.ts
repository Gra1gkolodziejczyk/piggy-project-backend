import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DrizzleService } from '@app/contracts/drizzle/drizzle.service';
import { users, accounts, banks, User } from '@app/contracts/database/schema';
import { SignUpDto } from '@app/contracts/authentication/dto/signup.dto';
import { SignInDto } from '@app/contracts/authentication/dto/signin.dto';

type PublicUser = Omit<User, 'stripeId'>;

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
  ) {}


  /**
   * Inscription d'un nouvel utilisateur avec création automatique du compte bancaire
   */
  async signUp(
    dto: SignUpDto,
  ): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
    const existingUser = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const refreshToken = this.jwtService.sign(
      { email: dto.email },
      { expiresIn: '7d' },
    );

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    const result = await this.drizzle.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: dto.email,
          name: dto.name,
          emailVerified: false,
          isActive: true,
        })
        .returning();

      const [newAccount] = await tx
        .insert(accounts)
        .values({
          userId: newUser.id,
          password: hashedPassword,
          refreshToken,
          refreshTokenExpiresAt,
        })
        .returning();

      const [newBank] = await tx
        .insert(banks)
        .values({
          userId: newUser.id,
          balance: '0.00',
          currency: 'EUR',
        })
        .returning();

      return { newUser, newAccount, newBank };
    });

    const accessToken = this.jwtService.sign({
      sub: result.newUser.id,
      email: result.newUser.email,
    });

    const { stripeId, ...publicUser } = result.newUser;
    const {
      password,
      refreshToken: _,
      ...accountWithoutSensitive
    } = result.newAccount;

    return {
      user: publicUser,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Connexion d'un utilisateur existant
   */
  async signIn(
    dto: SignInDto,
  ): Promise<{ user: User, accessToken: string; refreshToken: string }> {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const [account] = await this.drizzle.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .limit(1);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const isPasswordValid = bcrypt.compare(dto.password, account.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    await this.drizzle.db
      .update(accounts)
      .set({
        refreshToken,
        refreshTokenExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, user.id));

    return {
      user: user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rafraîchir l'access token avec le refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const [account] = await this.drizzle.db
        .select()
        .from(accounts)
        .where(eq(accounts.refreshToken, refreshToken))
        .limit(1);

      if (!account) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (new Date() > account.refreshTokenExpiresAt) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const [user] = await this.drizzle.db
        .select()
        .from(users)
        .where(eq(users.id, account.userId))
        .limit(1);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newAccessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '7d' },
      );

      const newRefreshTokenExpiresAt = new Date();
      newRefreshTokenExpiresAt.setDate(newRefreshTokenExpiresAt.getDate() + 7);

      await this.drizzle.db
        .update(accounts)
        .set({
          refreshToken: newRefreshToken,
          refreshTokenExpiresAt: newRefreshTokenExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(accounts.userId, user.id));

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Déconnexion - Invalide le refresh token
   */
  async signOut(userId: string): Promise<void> {
    const invalidRefreshToken = this.jwtService.sign(
      { invalidated: true },
      { expiresIn: '1s' },
    );

    await this.drizzle.db
      .update(accounts)
      .set({
        refreshToken: invalidRefreshToken,
        refreshTokenExpiresAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, userId));
  }
}
