import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

type JwtPayload = {
  id: string;
  sub: string;
  email: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }
  }

  async validate(payload: JwtPayload) {
    const userId = payload?.id ?? payload?.sub;
    if (!userId) {
      throw new UnauthorizedException();
    }
    // On garantit que request.user.id est toujours présent
    return {
      ...payload,
      id: userId,
    };
  }
}
