import * as dotenv from "dotenv";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../user/user.entity';
import { ChatSession } from "src/chat/chat-session.entity";

dotenv.config();
const secretOrKey = process.env.JWT_SECRET;

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatSession]),
    PassportModule,
    JwtModule.register({ secret: secretOrKey, signOptions: { expiresIn: '1h' } }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
