import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfseNotificationService } from './nfse-notification.service';
import { Nfse } from '@gym-management/domain';
import { NfseStatus } from '@gym-management/types';
import { EmailService } from './email.service';
import { RetryService } from './retry.service';

describe('NfseNotificationService', () => {
  let service: NfseNotificationService;
  let nfseRepository: Repository<Nfse>;

  const mockRepository = {
    findOne: jest.fn(),
  };

  const mockEmailService = {
    sendTemplate: jest.fn(),
  };

  const mockRetryService = {
    executeEmailWithRetry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfseNotificationService,
        {
          provide: getRepositoryToken(Nfse),
          useValue: mockRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: RetryService,
          useValue: mockRetryService,
        },
      ],
    }).compile();

    service = module.get<NfseNotificationService>(NfseNotificationService);
    nfseRepository = module.get<Repository<Nfse>>(getRepositoryToken(Nfse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyStatusChange', () => {
    it('should send notification for SENT status', async () => {
      const mockNfse = {
        id: 'uuid',
        number: 12345,
        recipientName: 'Test Customer',
        status: NfseStatus.SENT,
        student: { email: 'customer@example.com' },
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRetryService.executeEmailWithRetry.mockResolvedValue({
        success: true,
        result: { messageId: 'msg123' },
        attempts: 1,
        totalTimeMs: 1000,
      });

      await service.notifyStatusChange('uuid', NfseStatus.SENT);

      expect(mockRetryService.executeEmailWithRetry).toHaveBeenCalled();
    });

    it('should handle notification errors gracefully', async () => {
      const mockNfse = {
        id: 'uuid',
        number: 12345,
        recipientName: 'Test Customer',
        status: NfseStatus.SENT,
        student: { email: 'customer@example.com' },
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRetryService.executeEmailWithRetry.mockRejectedValue(
        new Error('Email error')
      );

      await expect(
        service.notifyStatusChange('uuid', NfseStatus.SENT)
      ).resolves.not.toThrow();
    });

    it('should handle NFS-e not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await service.notifyStatusChange('uuid', NfseStatus.SENT);

      expect(mockRetryService.executeEmailWithRetry).not.toHaveBeenCalled();
    });
  });

  describe('sendNfseToCustomer', () => {
    it('should send NFS-e to customer successfully', async () => {
      const mockNfse = {
        id: 'uuid',
        nfseNumber: '12345',
        serviceDescription: 'Test Service',
        serviceValue: 100.0,
        nfseLink: 'http://link.nfse',
        verificationCode: 'ABC123',
        recipientName: 'Test Customer',
        status: NfseStatus.APPROVED,
        student: { email: 'customer@example.com' },
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRetryService.executeEmailWithRetry.mockResolvedValue({
        success: true,
        result: { messageId: 'msg123' },
        attempts: 1,
        totalTimeMs: 1000,
      });

      const result = await service.sendNfseToCustomer('uuid');

      expect(result).toBe(true);
      expect(mockRetryService.executeEmailWithRetry).toHaveBeenCalled();
    });

    it('should fail when NFS-e not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.sendNfseToCustomer('uuid');

      expect(result).toBe(false);
    });

    it('should fail when NFS-e status is not approved', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.SENT, // Not approved
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);

      const result = await service.sendNfseToCustomer('uuid');

      expect(result).toBe(false);
    });

    it('should fail when no customer email found', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.APPROVED,
        student: null, // No student email
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);

      const result = await service.sendNfseToCustomer('uuid');

      expect(result).toBe(false);
    });
  });

  describe('sendBatchNotifications', () => {
    it('should send batch notifications successfully', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.APPROVED,
        student: { email: 'customer@example.com' },
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRetryService.executeEmailWithRetry.mockResolvedValue({
        success: true,
        result: { messageId: 'msg123' },
        attempts: 1,
        totalTimeMs: 1000,
      });

      await service.sendBatchNotifications(['uuid1', 'uuid2']);

      expect(mockRetryService.executeEmailWithRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe('sendReminderForPendingNfse', () => {
    it('should send reminder for pending NFS-e', async () => {
      const mockNfse = {
        id: 'uuid',
        number: 12345,
        recipientName: 'Test Customer',
        status: NfseStatus.SENT,
        emissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        student: { email: 'customer@example.com' },
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRetryService.executeEmailWithRetry.mockResolvedValue({
        success: true,
        result: { messageId: 'msg123' },
        attempts: 1,
        totalTimeMs: 1000,
      });

      await service.sendReminderForPendingNfse('uuid');

      expect(mockRetryService.executeEmailWithRetry).toHaveBeenCalled();
    });

    it('should not send reminder for non-SENT status', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.APPROVED, // Not SENT
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);

      await service.sendReminderForPendingNfse('uuid');

      expect(mockRetryService.executeEmailWithRetry).not.toHaveBeenCalled();
    });
  });

  describe('getCustomerEmail', () => {
    it('should return student email when available', () => {
      const mockNfse = {
        student: { email: 'student@example.com' },
      } as any;

      const email = service['getCustomerEmail'](mockNfse);

      expect(email).toBe('student@example.com');
    });

    it('should return null when no student email', () => {
      const mockNfse = {
        student: null,
      } as any;

      const email = service['getCustomerEmail'](mockNfse);

      expect(email).toBeNull();
    });

    it('should return null when student has no email', () => {
      const mockNfse = {
        student: { email: null },
      } as any;

      const email = service['getCustomerEmail'](mockNfse);

      expect(email).toBeNull();
    });
  });
});
