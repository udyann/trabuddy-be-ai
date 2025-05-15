import { ApiProperty } from "@nestjs/swagger";

export class UserNameDto {
  @ApiProperty({
      description: 'simple dto for only username',
    })
    username: string;
  }