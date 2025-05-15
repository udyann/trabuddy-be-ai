import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredDto } from './dto/authCred.dto';
import { UserNameDto } from './dto/username.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('checkduplicate')
  @ApiOperation({ summary: 'Check if a username is already taken' })
  @ApiBody({ type: UserNameDto })
  @ApiOkResponse({ description: 'Username is available' })
  @ApiConflictResponse({ description: 'Username already exists' })
  checkDuplicate(@Body() dto: UserNameDto) {
    return this.authService.checkDuplicate(dto.username);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthCredDto })
  @ApiCreatedResponse({ description: 'Signup successful' })
  @ApiConflictResponse({ description: 'Username already exists' })
  signup(@Body() dto: AuthCredDto) {
    return this.authService.signup(dto.username, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate and obtain an access token' })
  @ApiBody({ type: AuthCredDto })
  @ApiOkResponse({
    description: 'JWT access token issued',
    schema: { example: { access_token: 'eyJhbGciOiJIUzI1Ni…' } },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: AuthCredDto) {
    return this.authService.login(dto.username, dto.password);
  }
}
