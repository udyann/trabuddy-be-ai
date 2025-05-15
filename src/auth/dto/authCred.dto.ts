import { ApiProperty } from '@nestjs/swagger';

export class AuthCredDto {
  @ApiProperty({
    description: 'Unique username to register or login',
    example: 'lee123',
  })
  username: string;

  @ApiProperty({
    description: 'Password for the user',
    example: 'abcd',
  })
  password: string;
}
