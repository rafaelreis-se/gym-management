import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

/**
 * Password service for hashing and validation
 * Uses bcrypt with configurable rounds (like big companies do)
 */
@Injectable()
export class PasswordService {
  private readonly bcryptRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.bcryptRounds = this.configService.get('BCRYPT_ROUNDS', 10);
  }

  /**
   * Hash a password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Compare a plain password with a hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns True if passwords match
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a random password (for first access)
   * @param length Password length
   * @returns Random password
   */
  generateRandomPassword(length = 12): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

