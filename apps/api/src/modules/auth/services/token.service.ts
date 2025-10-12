import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken, User } from '@gym-management/domain';
import { randomBytes } from 'crypto';

/**
 * Token service for JWT and refresh token management
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  /**
   * Generate access token (JWT)
   */
  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(
    user: User,
    userAgent?: string,
    ipAddress?: string
  ): Promise<RefreshToken> {
    const token = randomBytes(64).toString('hex');
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d');
    const expiresAt = this.calculateExpirationDate(expiresIn);

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Verify and return user from refresh token
   */
  async verifyRefreshToken(token: string): Promise<User> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > refreshToken.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return refreshToken.user;
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { isRevoked: true }
    );
  }

  /**
   * Revoke all tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  /**
   * Clean expired tokens (run periodically)
   */
  async cleanExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * Calculate expiration date from string like "30d", "7d", "24h"
   */
  private calculateExpirationDate(expiresIn: string): Date {
    const now = new Date();
    const value = parseInt(expiresIn);
    const unit = expiresIn.slice(-1);

    switch (unit) {
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default
    }
  }
}

