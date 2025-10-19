import { Injectable, Logger } from '@nestjs/common';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryCondition?: (error: any) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: any;
  attempts: number;
  totalTimeMs: number;
}

/**
 * Retry Service for handling failed operations
 * Implements exponential backoff with jitter
 */
@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const {
      maxAttempts = 3,
      delayMs = 1000,
      backoffMultiplier = 2,
      maxDelayMs = 30000,
      retryCondition = () => true,
    } = options;

    const startTime = Date.now();
    let lastError: any;
    let attempts = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attempts = attempt;

      try {
        this.logger.log(`Attempt ${attempt}/${maxAttempts}`);
        const result = await operation();

        return {
          success: true,
          result,
          attempts,
          totalTimeMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed:`, error.message);

        // Check if we should retry
        if (!retryCondition(error) || attempt === maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const baseDelay = Math.min(
          delayMs * Math.pow(backoffMultiplier, attempt - 1),
          maxDelayMs
        );
        const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
        const delay = Math.floor(baseDelay + jitter);

        this.logger.log(`Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
      totalTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Execute operation with retry for webservice calls
   */
  async executeWebserviceWithRetry<T>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> {
    return await this.executeWithRetry(operation, {
      maxAttempts: 3,
      delayMs: 2000,
      backoffMultiplier: 2,
      maxDelayMs: 30000,
      retryCondition: (error) => {
        // Retry on network errors, timeout, or 5xx status codes
        return (
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.code === 'ENOTFOUND' ||
          (error.response && error.response.status >= 500) ||
          error.message?.includes('timeout') ||
          error.message?.includes('network')
        );
      },
    });
  }

  /**
   * Execute operation with retry for email sending
   */
  async executeEmailWithRetry<T>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> {
    return await this.executeWithRetry(operation, {
      maxAttempts: 5,
      delayMs: 5000,
      backoffMultiplier: 1.5,
      maxDelayMs: 60000,
      retryCondition: (error) => {
        // Retry on email service errors
        return (
          error.message?.includes('email') ||
          error.message?.includes('smtp') ||
          error.message?.includes('mail') ||
          (error.response && error.response.status >= 500)
        );
      },
    });
  }

  /**
   * Execute operation with retry for database operations
   */
  async executeDatabaseWithRetry<T>(
    operation: () => Promise<T>
  ): Promise<RetryResult<T>> {
    return await this.executeWithRetry(operation, {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      maxDelayMs: 10000,
      retryCondition: (error) => {
        // Retry on database connection errors
        return (
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.message?.includes('connection') ||
          error.message?.includes('timeout') ||
          error.message?.includes('deadlock')
        );
      },
    });
  }

  /**
   * Batch retry for multiple operations
   */
  async executeBatchWithRetry<T>(
    operations: Array<() => Promise<T>>,
    options: RetryOptions = {}
  ): Promise<Array<RetryResult<T>>> {
    this.logger.log(
      `Executing batch of ${operations.length} operations with retry`
    );

    const results = await Promise.allSettled(
      operations.map((operation) => this.executeWithRetry(operation, options))
    );

    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason,
          attempts: 1,
          totalTimeMs: 0,
        };
      }
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics
   */
  getRetryStats(results: Array<RetryResult<any>>): {
    total: number;
    successful: number;
    failed: number;
    averageAttempts: number;
    averageTimeMs: number;
  } {
    const total = results.length;
    const successful = results.filter((r) => r.success).length;
    const failed = total - successful;
    const averageAttempts =
      results.reduce((sum, r) => sum + r.attempts, 0) / total;
    const averageTimeMs =
      results.reduce((sum, r) => sum + r.totalTimeMs, 0) / total;

    return {
      total,
      successful,
      failed,
      averageAttempts,
      averageTimeMs,
    };
  }
}
