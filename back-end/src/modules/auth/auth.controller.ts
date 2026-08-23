import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() payload: any) {
    return this.authService.register(payload);
  }

  @Post('login')
  login(@Body() payload: any) {
    return this.authService.login(payload);
  }
}
