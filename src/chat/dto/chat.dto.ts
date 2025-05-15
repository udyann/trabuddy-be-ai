import { ApiProperty } from "@nestjs/swagger";

export class ChatDto {
  @ApiProperty({
    description: "dto for chat messages (from user & from llm)",
    example: "hello, help me plan a trip for paris"
  })
    message: string;
  }
  