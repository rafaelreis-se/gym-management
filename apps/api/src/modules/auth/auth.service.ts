import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@gym-management/domain';
import { AuthProvider, UserRole } from '@gym-management/common';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';

/**
 * Authentication service with multiple providers
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  /**
   * Register a new user (email/password)
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = registerDto.password
      ? await this.passwordService.hashPassword(registerDto.password)
      : null;

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      role: registerDto.role || UserRole.STUDENT,
      authProvider: AuthProvider.LOCAL,
      isFirstAccess: !registerDto.password, // If no password, first access is required
      studentId: registerDto.studentId,
      guardianId: registerDto.guardianId,
    });

    return this.userRepository.save(user);
  }

  /**
   * Login with email and password
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Check if first access
    if (user.isFirstAccess) {
      return {
        requiresPasswordSetup: true,
        userId: user.id,
        message: 'Please set your password on first access',
      };
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Set password on first access
   */
  async setPassword(userId: string, setPasswordDto: SetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.isFirstAccess && user.passwordHash) {
      throw new BadRequestException('Password already set');
    }

    user.passwordHash = await this.passwordService.hashPassword(
      setPasswordDto.password
    );
    user.isFirstAccess = false;

    await this.userRepository.save(user);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, authProvider: AuthProvider.LOCAL },
    });

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.passwordHash
    );

    return isPasswordValid ? user : null;
  }

  /**
   * Find or create user from OAuth provider
   */
  async findOrCreateOAuthUser(
    email: string,
    provider: AuthProvider,
    providerId: string,
    profile: { firstName?: string; lastName?: string }
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { email, authProvider: provider },
    });

    if (!user) {
      user = this.userRepository.create({
        email,
        authProvider: provider,
        providerId,
        role: UserRole.STUDENT,
        isFirstAccess: false, // OAuth users don't need password setup
      });

      await this.userRepository.save(user);
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const user = await this.tokenService.verifyRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = this.tokenService.generateAccessToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Logout and revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

