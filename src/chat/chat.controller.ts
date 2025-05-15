import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Param,
  ParseIntPipe,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from '../ai/ai.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SpeechService } from 'src/speech/speech.service';
import { SpeechDto } from './dto/speech.dto';
import { AIResponse } from '../ai/ai.types';


@ApiTags('Chat')
@ApiBearerAuth('access-token')
@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private aiService: AiService,
    private speechService: SpeechService,
  ) {}

  @Post('guest')
  @ApiOperation({ summary: 'Send response from llm, but does not save it in db' })
  @ApiResponse({
    status: 200,
    description: 'Response returned',
    schema: { example: { response: '파리 여행을 계획하시는군요! ~' }}
  })
  async guestChat(@Body() dto: ChatDto) {
    const reply = await this.aiService.getResponse(dto.message);
    return { response: reply };
  }

  @Post('session')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new chat session (need to put jwt in bearer)' })
  @ApiResponse({
    status: 201,
    description: 'Session created',
    schema: { example: { sessionId: 1 } },
  })
  async createSession(@Request() req) {
    const username = req.user.username;
    const session = await this.chatService.createSession(username);
    return { sessionId: session.id };
  }

  @Post('session/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send a message and receive AI reply (need to put jwt in bearer)' })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'ID of the chat session',
    example: 1,
  })
  @ApiBody({ type: ChatDto })
  @ApiResponse({
    status: 200,
    description: 'AI response returned',
    schema: { example: { "response": {
        "category": "contents",
        "answer": "뉴욕 여행 계획을 세우시는군요! 현지 음식을 즐기고 싶으시다니, 정말 멋진 계획입니다. ~~",
        "image_url": "https://images.pexels.com/photos/~~"},
  }}},)
  async chat(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
    @Body() dto: ChatDto,
  ) {
    const username = req.user.username;
    await this.chatService.save(username, sessionId, 'user', dto.message);

    const reply = await this.aiService.getResponse(dto.message);

    console.log('reply received from AI:', reply);
    console.log('summary:', reply.summary);
    await this.chatService.save(
    username,
    sessionId,
    'assistant',
    reply.summary,
    reply.category,
    reply.imageurl,
    typeof reply.message === 'string' ? undefined : reply.message,
  );

    return { response: reply };
  }

  @Get('session/:id/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get message history for a session (need to put jwt in bearer)' })
  @ApiParam({
    name: 'id',
    type: 'integer',
    description: 'ID of the chat session',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of messages in the session',
    schema: {
      example: {
        sessionHistory: [
          {
            id: 1,
            message: 'Hi there',
            role: 'user',
            createdAt: '2025-05-10T08:45:30.123Z',
          },
          {
            id: 2,
            message: 'Hello! How can I assist?',
            role: 'assistant',
            createdAt: '2025-05-10T08:45:31.456Z',
          },
        ],
      },
    },
  })
  async history(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
  ) {
    const username = req.user.username;
    const sessionHistory = await this.chatService.getSessionHistory(
      username,
      sessionId,
    );
    return { sessionHistory };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all chat sessions for the user (need to put jwt in bearer)' })
  @ApiResponse({
    status: 200,
    description: 'Array of sessions',
    schema: {
      example: {
        sessions: [
          { id: 2, createdAt: '2025-05-10T07:30:00.000Z' },
          { id: 1, createdAt: '2025-05-09T15:20:00.000Z' },
        ],
      },
    },
  })
  async listUserSessions(@Request() req) {
    const username = req.user.username;
    const sessions = await this.chatService.getUserSessions(username);
    return { sessions };
  }

  /*
  @Post('session/:id/speech')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send speech audio and receive AI reply' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Session ID' })
  @ApiBody({
    schema: {
      example: {
        base64Audio: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YcQAA...',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'AI reply with text/image' })
  async speechToMessage(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req,
    @Body() body: { base64Audio: string },
  ) {
    const username = req.user.username;
    const text = await this.speechService.transcribe(body.base64Audio);
    if (!text) throw new BadRequestException('음성을 인식하지 못했습니다.');

    await this.chatService.save(username, sessionId, 'user', text);
    const reply = await this.aiService.getResponse(text);
    await this.chatService.save(
      username,
      sessionId,
      'assistant',
      JSON.stringify(reply.message),
      reply.category,
      reply.imageurl,
    );

    return { response: reply };
  }
    */

  @Delete('session/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Request() req
  ) {
    const username = req.user.username;
    await this.chatService.deleteSession(username, sessionId);
    return { message: 'Session deleted successfully' };
  }


  
}
