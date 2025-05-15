import { ApiProperty } from "@nestjs/swagger";


export class SpeechDto {
  @ApiProperty({
    description: "base64 encoded audio",
    example: ""
  })
    base64Audio: string;
  }
  