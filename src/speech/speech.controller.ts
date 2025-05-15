import { Body, Controller, Post } from '@nestjs/common';
import { SpeechService } from './speech.service';
import { ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('speech')
@Controller('speech')
export class SpeechController { constructor ( private speechService: SpeechService){}

    @Post('transcribe')
    @ApiOperation({ summary: 'do speech-to-text on given base64Audio' })
    @ApiBody({
        schema: {
            properties: {
            base64Audio: { type: "string" }
            }
        }
        })
    @ApiOkResponse({
        description: 'correctly transcribed',
        schema: { example: { response: '안녕, 나는 프랑스 파리에 여행을 갈 거야. ...' } },
      })
    @ApiInternalServerErrorResponse({ description: 'could not transcribe' })
    async transcribe(@Body('base64Audio') base64Audio: string){
        const transcribed = await this.speechService.transcribe(base64Audio);
        return {response: transcribed};
    }

}
