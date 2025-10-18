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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@gym-management/domain';
import { ResponseMessage } from '../../common/interceptors/api-response.interceptor';

type SanitizedUser = Omit<User, 'passwordHash'>;

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
  @ResponseMessage('User registered successfully')
  register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ResponseMessage('Login successful')
  login(
    @Body() loginDto: LoginDto
  ): Promise<
    | { requiresPasswordSetup: boolean; userId: string; message: string }
    | { accessToken: string; refreshToken: string; user: SanitizedUser }
  > {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set password on first access' })
  @ApiResponse({ status: 200, description: 'Password set successfully' })
  @ResponseMessage('Password set successfully')
  async setPassword(
    @Body() body: { userId: string } & SetPasswordDto
  ): Promise<void> {
    return this.authService.setPassword(body.userId, body);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  @ResponseMessage('Token refreshed successfully')
  refresh(
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<{ accessToken: string; user: SanitizedUser }> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiBearerAuth()
  @ResponseMessage('Logout successful')
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<void> {
    await this.authService.logout(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile successfully retrieved',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ResponseMessage('User profile successfully retrieved')
  getProfile(@CurrentUser() user: User): User {
    return user;
  }

  @Public()
  @Get('dev-tokens')
  @ApiOperation({
    summary: 'Get development tokens (Development only)',
    description:
      'Returns JWT tokens for all default users. Only available in development.',
  })
  @ApiResponse({
    status: 200,
    description: 'Development tokens successfully generated',
  })
  @ApiResponse({ status: 403, description: 'Not available in production' })
  @ResponseMessage('Development tokens successfully generated')
  async getDevTokens(): Promise<{
    message: string;
    note: string;
    tokens: {
      role: string;
      email: string;
      accessToken: string;
      refreshToken: string;
    }[];
    usage: Record<string, string>;
  }> {
    return this.authService.getDevTokens();
  }

  @Public()
  @Post('validate-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate password strength',
    description: 'Check password strength according to security policies',
  })
  @ApiResponse({ status: 200, description: 'Password validation completed' })
  @ResponseMessage('Password validation completed')
  validatePassword(@Body() body: { password: string }): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    return this.authService.validatePasswordStrength(body.password);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  @ResponseMessage('Redirecting to Google authentication')
  googleLogin(): void {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ResponseMessage('Google login successful')
  async googleCallback(
    @CurrentUser() user: User
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const accessToken =
      this.authService['tokenService'].generateAccessToken(user);
    const refreshToken = await this.authService[
      'tokenService'
    ].generateRefreshToken(user);

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
  @ResponseMessage('Redirecting to Facebook authentication')
  facebookLogin(): void {
    // Guard redirects to Facebook
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ResponseMessage('Facebook login successful')
  async facebookCallback(
    @CurrentUser() user: User
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const accessToken =
      this.authService['tokenService'].generateAccessToken(user);
    const refreshToken = await this.authService[
      'tokenService'
    ].generateRefreshToken(user);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user,
    };
  }
}
