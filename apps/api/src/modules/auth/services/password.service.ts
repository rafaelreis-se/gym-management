import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/**
 * Professional password service following enterprise security standards
 * - Uses bcrypt for password hashing (industry standard)
 * - Configurable cost factor based on environment
 * - Secure random password generation
 * - Constant-time comparison to prevent timing attacks
 */
@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly bcryptRounds: number;
  private readonly minPasswordLength: number;

  constructor(private readonly configService: ConfigService) {
    // Higher cost for production, lower for development/testing
    this.bcryptRounds = this.configService.get(
      'BCRYPT_ROUNDS',
      process.env['NODE_ENV'] === 'production' ? 12 : 10
    );
    this.minPasswordLength = this.configService.get('MIN_PASSWORD_LENGTH', 8);

    this.logger.log(
      `Password service initialized with ${this.bcryptRounds} rounds`
    );
  }

  /**
   * Hash a password using bcrypt with salt
   * Cost factor automatically adjusts based on environment
   * @param password Plain text password
   * @returns Promise<string> Hashed password with salt
   */
  async hashPassword(password: string): Promise<string> {
    if (!password || password.length < this.minPasswordLength) {
      throw new Error(
        `Password must be at least ${this.minPasswordLength} characters long`
      );
    }

    try {
      const hash = await bcrypt.hash(password, this.bcryptRounds);
      this.logger.debug('Password hashed successfully');
      return hash;
    } catch (error) {
      this.logger.error('Failed to hash password', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Compare a plain password with a hash using constant-time comparison
   * @param password Plain text password
   * @param hash Hashed password from database
   * @returns Promise<boolean> True if passwords match
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    try {
      const isValid = await bcrypt.compare(password, hash);
      this.logger.debug(
        `Password comparison: ${isValid ? 'valid' : 'invalid'}`
      );
      return isValid;
    } catch (error) {
      this.logger.error('Password comparison failed', error);
      return false;
    }
  }

  /**
   * Generate a cryptographically secure random password
   * Uses crypto.randomBytes for secure randomness
   * @param length Password length (default: 16)
   * @param includeSymbols Include special characters (default: true)
   * @returns string Secure random password
   */
  generateSecurePassword(length = 16, includeSymbols = true): string {
    if (length < this.minPasswordLength) {
      length = this.minPasswordLength;
    }

    // Character sets following OWASP recommendations
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = includeSymbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '';

    const allChars = lowercase + uppercase + numbers + symbols;

    // Ensure at least one character from each required set
    let password = '';
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(numbers);

    if (includeSymbols) {
      password += this.getRandomChar(symbols);
    }

    // Fill remaining length with random characters
    const remainingLength = length - password.length;
    for (let i = 0; i < remainingLength; i++) {
      password += this.getRandomChar(allChars);
    }

    // Shuffle the password to avoid predictable patterns
    return this.shuffleString(password);
  }

  /**
   * Validate password strength according to security policies
   * @param password Password to validate
   * @returns object Validation result with strength score and recommendations
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.minPasswordLength) {
      feedback.push(
        `Password must be at least ${this.minPasswordLength} characters long`
      );
    } else {
      score += 1;
    }

    // Character variety checks
    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain lowercase letters');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain uppercase letters');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Password must contain numbers');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) {
      feedback.push('Password should contain special characters');
    } else {
      score += 1;
    }

    // Length bonus
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    return {
      isValid: score >= 4 && password.length >= this.minPasswordLength,
      score: Math.min(score, 7),
      feedback,
    };
  }

  /**
   * Get a cryptographically secure random character from charset
   */
  private getRandomChar(charset: string): string {
    const randomBytes = crypto.randomBytes(1);
    const randomIndex = randomBytes[0] % charset.length;
    return charset[randomIndex];
  }

  /**
   * Shuffle string using Fisher-Yates algorithm with crypto random
   */
  private shuffleString(str: string): string {
    const array = str.split('');

    for (let i = array.length - 1; i > 0; i--) {
      const randomBytes = crypto.randomBytes(2);
      const randomIndex = (randomBytes[0] + (randomBytes[1] << 8)) % (i + 1);
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }

    return array.join('');
  }
}
