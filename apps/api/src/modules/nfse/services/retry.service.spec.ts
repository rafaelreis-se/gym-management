import { Test, TestingModule } from '@nestjs/testing';
import { RetryService } from './retry.service';

describe('RetryService', () => {
  let service: RetryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryService],
    }).compile();

    service = module.get<RetryService>(RetryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executeWithRetry', () => {
    it('should execute operation successfully on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await service.executeWithRetry(operation);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(result.totalTimeMs).toBeGreaterThanOrEqual(0);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const result = await service.executeWithRetry(operation, {
        maxAttempts: 3,
        delayMs: 10, // Short delay for testing
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max attempts', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('Persistent error'));

      const result = await service.executeWithRetry(operation, {
        maxAttempts: 2,
        delayMs: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error.message).toBe('Persistent error');
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should respect retry condition', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error('Non-retryable error'));

      const result = await service.executeWithRetry(operation, {
        maxAttempts: 3,
        delayMs: 10,
        retryCondition: (error) => error.message !== 'Non-retryable error',
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Network error'));

      const startTime = Date.now();
      const result = await service.executeWithRetry(operation, {
        maxAttempts: 2,
        delayMs: 100,
        backoffMultiplier: 2,
      });
      const endTime = Date.now();

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);
      expect(endTime - startTime).toBeGreaterThan(100); // Should have delayed
    });
  });

  describe('executeWebserviceWithRetry', () => {
    it('should execute operation successfully on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await service.executeWebserviceWithRetry(operation);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on network errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');

      const result = await service.executeWithRetry(operation, {
        maxAttempts: 2,
        delayMs: 10,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should not retry on 4xx status codes', async () => {
      const operation = jest
        .fn()
        .mockRejectedValue({ response: { status: 400 } });

      const result = await service.executeWebserviceWithRetry(operation);

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
    });
  });

  describe('executeEmailWithRetry', () => {
    it('should execute operation successfully on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await service.executeEmailWithRetry(operation);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on email service errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('SMTP connection failed'))
        .mockResolvedValue('success');

      const result = await service.executeWithRetry(operation, {
        maxAttempts: 2,
        delayMs: 10,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    }, 10000);
  });

  describe('executeDatabaseWithRetry', () => {
    it('should execute operation successfully on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await service.executeDatabaseWithRetry(operation);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on connection errors', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValue('success');

      const result = await service.executeWithRetry(operation, {
        maxAttempts: 2,
        delayMs: 10,
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    }, 10000);
  });

  describe('executeBatchWithRetry', () => {
    it('should execute multiple operations with retry', async () => {
      const operations = [
        jest.fn().mockResolvedValue('result1'),
        jest
          .fn()
          .mockRejectedValueOnce(new Error('Error'))
          .mockResolvedValue('result2'),
        jest.fn().mockResolvedValue('result3'),
      ];

      const results = await service.executeBatchWithRetry(operations, {
        maxAttempts: 2,
        delayMs: 10,
      });

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[0].result).toBe('result1');
      expect(results[1].success).toBe(true);
      expect(results[1].result).toBe('result2');
      expect(results[2].success).toBe(true);
      expect(results[2].result).toBe('result3');
    });

    it('should handle mixed success and failure results', async () => {
      const operations = [
        jest.fn().mockResolvedValue('result1'),
        jest.fn().mockRejectedValue(new Error('Persistent error')),
        jest.fn().mockResolvedValue('result3'),
      ];

      const results = await service.executeBatchWithRetry(operations, {
        maxAttempts: 2,
        delayMs: 10,
      });

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });

  describe('getRetryStats', () => {
    it('should calculate retry statistics correctly', () => {
      const results = [
        { success: true, attempts: 1, totalTimeMs: 100 },
        { success: true, attempts: 2, totalTimeMs: 200 },
        { success: false, attempts: 3, totalTimeMs: 300 },
        { success: true, attempts: 1, totalTimeMs: 150 },
      ];

      const stats = service.getRetryStats(results);

      expect(stats.total).toBe(4);
      expect(stats.successful).toBe(3);
      expect(stats.failed).toBe(1);
      expect(stats.averageAttempts).toBe(1.75);
      expect(stats.averageTimeMs).toBe(187.5);
    });

    it('should handle empty results', () => {
      const results = [];

      const stats = service.getRetryStats(results);

      expect(stats.total).toBe(0);
      expect(stats.successful).toBe(0);
      expect(stats.failed).toBe(0);
      expect(isNaN(stats.averageAttempts)).toBe(true);
      expect(isNaN(stats.averageTimeMs)).toBe(true);
    });
  });
});
