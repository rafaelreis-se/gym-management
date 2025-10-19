import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfseWorkflowService } from './nfse-workflow.service';
import { Nfse } from '@gym-management/domain';
import { NfseStatus } from '@gym-management/types';
import { NfseWebService } from './nfse-webservice.service';
import { XmlSigningService } from './xml-signing.service';
import { RetryService } from './retry.service';

describe('NfseWorkflowService', () => {
  let service: NfseWorkflowService;
  let nfseRepository: Repository<Nfse>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockWebService = {
    sendNfse: jest.fn(),
    cancelNfse: jest.fn(),
    consultNfseStatus: jest.fn(),
  };

  const mockXmlSigningService = {
    generateNfseXml: jest.fn(),
    signXml: jest.fn(),
  };

  const mockRetryService = {
    executeWebserviceWithRetry: jest.fn(),
    executeDatabaseWithRetry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfseWorkflowService,
        {
          provide: getRepositoryToken(Nfse),
          useValue: mockRepository,
        },
        {
          provide: NfseWebService,
          useValue: mockWebService,
        },
        {
          provide: XmlSigningService,
          useValue: mockXmlSigningService,
        },
        {
          provide: RetryService,
          useValue: mockRetryService,
        },
      ],
    }).compile();

    service = module.get<NfseWorkflowService>(NfseWorkflowService);
    nfseRepository = module.get<Repository<Nfse>>(getRepositoryToken(Nfse));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRps', () => {
    it('should create RPS successfully', async () => {
      const nfseData = {
        serviceDescription: 'Test Service',
        serviceAmount: 100.0,
        providerCnpj: '12345678000195',
        takerName: 'Test Customer',
      };

      const mockNfse = {
        id: 'uuid',
        ...nfseData,
        status: NfseStatus.DRAFT,
        rpsNumber: 'RPS123',
        rpsSeries: 'NF',
        rpsEmissionDate: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNfse);
      mockRepository.save.mockResolvedValue(mockNfse);

      const result = await service.createRps(nfseData);

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(NfseStatus.DRAFT);
      expect(result.message).toBe('RPS created successfully');
      expect(result.data).toEqual(mockNfse);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...nfseData,
          status: NfseStatus.DRAFT,
        })
      );
      expect(mockRepository.save).toHaveBeenCalledWith(mockNfse);
    });

    it('should handle creation errors', async () => {
      const nfseData = {
        serviceDescription: 'Test Service',
        serviceAmount: 100.0,
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await service.createRps(nfseData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error creating RPS');
      expect(result.newStatus).toBe(NfseStatus.DRAFT);
    });
  });

  describe('validateRps', () => {
    it('should validate RPS successfully', async () => {
      const mockNfse = {
        id: 'uuid',
        serviceDescription: 'Test Service',
        serviceValue: 100.0,
        providerCnpj: '12345678000195',
        recipientName: 'Test Customer',
        status: NfseStatus.DRAFT,
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await service.validateRps('uuid');

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(NfseStatus.VALIDATED);
      expect(result.message).toBe('RPS validated successfully');
      expect(mockRepository.update).toHaveBeenCalledWith('uuid', {
        status: NfseStatus.VALIDATED,
      });
    });

    it('should fail validation when NFS-e not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateRps('uuid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('NFS-e not found');
      expect(result.newStatus).toBe(NfseStatus.DRAFT);
    });

    it('should fail validation on business rule violations', async () => {
      const mockNfse = {
        id: 'uuid',
        serviceDescription: '', // Invalid: empty description
        serviceValue: 0, // Invalid: zero amount
        providerCnpj: '', // Invalid: empty CNPJ
        recipientName: '', // Invalid: empty name
        status: NfseStatus.DRAFT,
      } as any;

      mockRepository.findOne.mockResolvedValue(mockNfse);

      const result = await service.validateRps('uuid');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation errors');
      expect(result.newStatus).toBe(NfseStatus.DRAFT);
    });
  });

  describe('sendRpsToWebservice', () => {
    it('should send RPS to webservice successfully', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.VALIDATED,
        serviceDescription: 'Test Service',
        serviceValue: 100.0,
      } as any;

      const mockResponse = {
        success: true,
        nfseNumber: '12345',
        nfseDate: new Date(),
        nfseCode: 'ABC123',
        nfseLink: 'http://link.nfse',
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRepository.update.mockResolvedValue(undefined);
      mockXmlSigningService.generateNfseXml.mockResolvedValue(
        '<xml>generated</xml>'
      );
      mockXmlSigningService.signXml.mockResolvedValue('<xml>signed</xml>');
      mockRetryService.executeWebserviceWithRetry.mockResolvedValue({
        success: true,
        result: mockResponse,
        attempts: 1,
        totalTimeMs: 1000,
      });

      const result = await service.sendRpsToWebservice('uuid');

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(NfseStatus.SENT);
      expect(result.message).toBe('RPS sent successfully');
      expect(mockRepository.update).toHaveBeenCalledWith('uuid', {
        status: NfseStatus.SENDING,
      });
      expect(mockRepository.update).toHaveBeenCalledWith('uuid', {
        status: NfseStatus.SENT,
        nfseNumber: '12345',
        nfseDate: mockResponse.nfseDate,
        verificationCode: 'ABC123',
        nfseLink: 'http://link.nfse',
      });
    });

    it('should handle webservice errors', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.VALIDATED,
        serviceDescription: 'Test Service',
        serviceAmount: 100.0,
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRepository.update.mockResolvedValue(undefined);
      mockXmlSigningService.generateNfseXml.mockResolvedValue(
        '<xml>generated</xml>'
      );
      mockXmlSigningService.signXml.mockResolvedValue('<xml>signed</xml>');
      mockRetryService.executeWebserviceWithRetry.mockResolvedValue({
        success: false,
        error: 'Webservice error',
        attempts: 3,
        totalTimeMs: 3000,
      });

      const result = await service.sendRpsToWebservice('uuid');

      expect(result.success).toBe(false);
      expect(result.newStatus).toBe(NfseStatus.SEND_ERROR);
      expect(result.message).toContain('Webservice error after 3 attempts');
      expect(mockRepository.update).toHaveBeenCalledWith('uuid', {
        status: NfseStatus.SEND_ERROR,
      });
    });

    it('should fail when RPS is not validated', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.DRAFT, // Not validated
        serviceDescription: 'Test Service',
        serviceAmount: 100.0,
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);

      const result = await service.sendRpsToWebservice('uuid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('RPS must be validated before sending');
      expect(result.newStatus).toBe(NfseStatus.DRAFT);
    });
  });

  describe('checkProcessingStatus', () => {
    it('should check processing status successfully', async () => {
      const mockNfse = {
        id: 'uuid',
        nfseNumber: 12345,
        status: NfseStatus.SENT,
      };

      const mockStatusResponse = {
        success: true,
        status: 'APPROVED',
        observations: 'NFS-e approved',
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRepository.update.mockResolvedValue(undefined);
      mockWebService.consultNfseStatus.mockResolvedValue(mockStatusResponse);

      const result = await service.checkProcessingStatus('uuid');

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(NfseStatus.APPROVED);
      expect(result.message).toBe('NFS-e approved by municipality');
      expect(mockRepository.update).toHaveBeenCalledWith('uuid', {
        status: NfseStatus.APPROVED,
      });
    });

    it('should handle different status responses', async () => {
      const mockNfse = {
        id: 'uuid',
        nfseNumber: 12345,
        status: NfseStatus.SENT,
      };

      const testCases = [
        { status: 'PROCESSING', expectedStatus: NfseStatus.PROCESSING },
        { status: 'REJECTED', expectedStatus: NfseStatus.REJECTED },
        { status: 'UNKNOWN', expectedStatus: NfseStatus.PROCESSING },
      ];

      for (const testCase of testCases) {
        mockRepository.findOne.mockResolvedValue(mockNfse);
        mockRepository.update.mockResolvedValue(undefined);
        mockWebService.consultNfseStatus.mockResolvedValue({
          success: true,
          status: testCase.status,
          observations: 'Status response',
        });

        const result = await service.checkProcessingStatus('uuid');

        expect(result.success).toBe(true);
        expect(result.newStatus).toBe(testCase.expectedStatus);
      }
    });

    it('should fail when NFS-e not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.checkProcessingStatus('uuid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('NFS-e not found or not sent yet');
    });

    it('should fail when NFS-e has no number', async () => {
      const mockNfse = {
        id: 'uuid',
        nfseNumber: null,
        status: NfseStatus.SENT,
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);

      const result = await service.checkProcessingStatus('uuid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('NFS-e not found or not sent yet');
    });
  });

  describe('cancelNfse', () => {
    it('should cancel NFS-e successfully', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.DRAFT,
        nfseNumber: 12345,
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRepository.update.mockResolvedValue(undefined);

      const result = await service.cancelNfse('uuid', 'Test reason');

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(NfseStatus.CANCELLED);
      expect(result.message).toBe('NFS-e cancelled successfully');
      expect(mockRepository.update).toHaveBeenCalledWith('uuid', {
        status: NfseStatus.CANCELLED,
      });
    });

    it('should cancel NFS-e that was sent to webservice', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.SENT,
        nfseNumber: '12345',
      } as any;

      const mockCancelResponse = {
        success: true,
        observations: 'NFS-e cancelled',
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockRepository.update.mockResolvedValue(undefined);
      mockWebService.cancelNfse.mockResolvedValue(mockCancelResponse);
      mockRetryService.executeWebserviceWithRetry.mockImplementation((fn) =>
        Promise.resolve({
          success: true,
          result: mockCancelResponse,
          attempts: 1,
        })
      );

      const result = await service.cancelNfse('uuid', 'Test reason');

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe(NfseStatus.CANCELLED);
      expect(mockWebService.cancelNfse).toHaveBeenCalledWith(
        expect.stringContaining('<CancelamentoNfse>')
      );
    });

    it('should fail to cancel NFS-e in non-cancellable status', async () => {
      const mockNfse = {
        id: 'uuid',
        status: NfseStatus.APPROVED, // Cannot cancel approved NFS-e
        nfseNumber: 12345,
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);

      const result = await service.cancelNfse('uuid', 'Test reason');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot cancel NFS-e in status');
      expect(result.newStatus).toBe(NfseStatus.APPROVED);
    });

    it('should fail when NFS-e not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.cancelNfse('uuid', 'Test reason');

      expect(result.success).toBe(false);
      expect(result.message).toBe('NFS-e not found');
      expect(result.newStatus).toBe(NfseStatus.CANCELLED);
    });
  });
});
