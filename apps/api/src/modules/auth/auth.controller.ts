import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@gym-management/domain';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set password on first access' })
  @ApiResponse({ status: 200, description: 'Password set successfully' })
  async setPassword(
    @Body() body: { userId: string } & SetPasswordDto
  ): Promise<{ message: string }> {
    await this.authService.setPassword(body.userId, body);
    return { message: 'Password set successfully' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiBearerAuth()
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  googleLogin() {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@CurrentUser() user: User) {
    const accessToken = this.authService['tokenService'].generateAccessToken(user);
    const refreshToken = await this.authService['tokenService'].generateRefreshToken(
      user
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user,
    };
  }

  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Login with Facebook' })
  facebookLogin() {
    // Guard redirects to Facebook
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookCallback(@CurrentUser() user: User) {
    const accessToken = this.authService['tokenService'].generateAccessToken(user);
    const refreshToken = await this.authService['tokenService'].generateRefreshToken(
      user
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user,
    };
  }
}

