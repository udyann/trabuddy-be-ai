import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcryptjs';
import { ChatSession } from 'src/chat/chat-session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ChatSession) private sessionRepo: Repository<ChatSession>,
    private jwtService: JwtService,
  ) {}

  async checkDuplicate(username:string) {
    const user = await this.userRepo.findOne({where: { username }})
    if (user) {
      throw new ConflictException('Existing Username');
    } else {
      return { message: 'Available Username'}
    }
  }

  async signup(username: string, password: string) {
    const salt = await bcrypt.genSalt();
    const hasedPassword = await bcrypt.hash(password, salt);


    const user = this.userRepo.create({username, password: hasedPassword });
    try{
      await this.userRepo.save(user);
    } catch(error) {
        if(error.code === '23505') {
          throw new ConflictException('Existing username');
        } else {
          throw new InternalServerErrorException();
        }
    }
    //return this.userRepo.save(user);
    return { message: 'signup success'};
  }

  async login(username: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username };
      const latestSession = await this.sessionRepo.findOne({
      where: { user: { username } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
  });
      return { access_token: this.jwtService.sign(payload), sessionId: latestSession?.id ?? null };
    } else {
      throw new UnauthorizedException('login failed')
    }
    
  }
}
