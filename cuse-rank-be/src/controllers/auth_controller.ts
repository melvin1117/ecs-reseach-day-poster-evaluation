import { Controller, Post, Param, Body } from '@nestjs/common';
import { ScoringService } from '../services/scoring.service';
import { AuthService } from '../services/auth_service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() userData: { name: string; email: string; password: string }) {
    return await this.authService.signup(userData);
  }

  @Post('login')
  async login(@Body() credentials: { name: string; email: string; password: string }) {
    return await this.authService.login(credentials);
  }
}