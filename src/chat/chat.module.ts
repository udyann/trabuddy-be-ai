import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat-message.entity';
import { ChatSession } from './chat-session.entity';
import { User } from 'src/user/user.entity';
import { SpeechModule } from 'src/speech/speech.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatMessage, ChatSession, User]), SpeechModule],
  exports: [TypeOrmModule],
})
export class ChatModule {}
