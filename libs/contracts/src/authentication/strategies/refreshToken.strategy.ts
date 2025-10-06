import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { jwtConstants } from '../constant';
import { Request } from 'express';

type JwtPayload = {
  id: string;
  sub: string;
  email: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    console.log(req.headers);
    console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ForbiddenException('Authorization header is missing');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token missing');
    }

    return {
      userId: payload.sub,
      sub: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
