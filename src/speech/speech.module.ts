import { Module } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { SpeechController } from './speech.controller';

@Module({
  providers: [SpeechService],
  exports: [SpeechService],
  controllers: [SpeechController],
})
export class SpeechModule {}
