import * as dotenv from "dotenv";
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


dotenv.config();
const secretOrKey = process.env.JWT_SECRET;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretOrKey
    });
  }

  async validate(payload: any) {
    return { username: payload.username };
  }
}
