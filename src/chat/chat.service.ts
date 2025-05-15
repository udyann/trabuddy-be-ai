import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatMessage } from './chat-message.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ChatSession } from './chat-session.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepo: Repository<ChatMessage>,

    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async save(
  username: string,
  sessionId: number,
  role: 'user' | 'assistant',
  summary: string,
  category?: string,
  imageURL?: string | null,
  structuredMessage?: Record<string, any>,
  ) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, user:{username} }, relations: ['user'] });
    if (!session) {
    throw new NotFoundException('Session not found for this user');
    }
    const message = this.chatRepo.create({
      session,
      role,
      message: summary,
      category,
      imageURL,
      structuredMessage,
    });
    return this.chatRepo.save(message);
  }

  async getSessionHistory(username: string, sessionId: number): Promise<ChatMessage[]> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, user: { username } },
      relations: ['user'],
    });
        if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found for user ${username}`);
    }

    return this.chatRepo.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
    });
  }
  
  async createSession(username: string): Promise<ChatSession> {
  const user = await this.userRepo.findOne({ where: { username } });
  if (!user) throw new NotFoundException('User not found');

  const session = this.sessionRepo.create({ user });
  return this.sessionRepo.save(session);
  }

  async getUserSessions(username: string): Promise<ChatSession[]> {
  return this.sessionRepo.find({
    where: { user: { username } },
    order: { createdAt: 'DESC' },
  });
  }

  async deleteSession(username: string, sessionId: number): Promise<void> {
  const session = await this.sessionRepo.findOne({
    where: { id: sessionId, user: { username } },
    relations: ['user'],
  });

  if (!session) {
    throw new NotFoundException('Session not found for this user');
  }

  await this.sessionRepo.remove(session);
}

}
