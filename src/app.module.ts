import * as dotenv from "dotenv";
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { ChatMessage } from './chat/chat-message.entity';
import { AiService } from './ai/ai.service';
import { ChatSession } from "./chat/chat-session.entity";
import { ConfigModule } from '@nestjs/config';
import { SpeechModule } from './speech/speech.module';
import { SpeechController } from "./speech/speech.controller";
import { SpeechService } from "./speech/speech.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DATABASE,
      entities: [User, ChatMessage, ChatSession],
      synchronize: true,
      dropSchema: false,
    }),
    AuthModule,
    UserModule,
    ChatModule,
    SpeechModule,
  ],
  controllers: [AppController, ChatController, SpeechController],
  providers: [AppService, ChatService, AiService, SpeechService],
})
export class AppModule {}
