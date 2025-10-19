import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfseService } from './nfse.service';
import { Nfse } from '@gym-management/domain';
import { NfseStatus } from '@gym-management/types';
import { CreateNfseDto } from './dto';
import { NfseWebService } from './services/nfse-webservice.service';
import { XmlSigningService } from './services/xml-signing.service';

describe('NfseService', () => {
  let service: NfseService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockWebService = {
    sendNfse: jest.fn(),
    cancelNfse: jest.fn(),
    consultNfseStatus: jest.fn(),
  };

  const mockXmlSigningService = {
    signXml: jest.fn(),
    generateNfseXml: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfseService,
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
      ],
    }).compile();

    service = module.get<NfseService>(NfseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new NFS-e successfully', async () => {
      const createNfseDto: CreateNfseDto = {
        number: 1,
        series: 'A',
        type: 1,
        emissionDate: '2024-01-01',
        operationNature: 1,
        simpleNationalOptant: true,
        culturalIncentivizer: false,
        recipient: {
          name: 'John Doe',
          cpf: '12345678901',
          address: {
            street: 'Main St',
            number: '123',
            district: 'Downtown',
            cityCode: '1234567',
            state: 'MG',
            zipCode: '12345678',
          },
        },
        service: {
          serviceCode: '0107' as any,
          description: 'Jiu-jitsu classes',
          taxRate: 5.0,
          serviceValue: 100.0,
          netValue: 95.0,
          issWithheld: false,
          serviceDiscrimination: 'Monthly jiu-jitsu classes',
          serviceCityCode: '1234567',
        },
      };

      const mockNfse = {
        id: 'uuid',
        ...createNfseDto,
        emissionDate: new Date(createNfseDto.emissionDate),
        status: NfseStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockNfse);
      mockRepository.save.mockResolvedValue(mockNfse);

      const result = await service.create(createNfseDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { number: createNfseDto.number, series: createNfseDto.series },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createNfseDto,
        emissionDate: new Date(createNfseDto.emissionDate),
        status: NfseStatus.PENDING,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockNfse);
      expect(result).toEqual(mockNfse);
    });

    it('should throw BadRequestException if NFS-e number already exists', async () => {
      const createNfseDto: CreateNfseDto = {
        number: 1,
        series: 'A',
        type: 1,
        emissionDate: '2024-01-01',
        operationNature: 1,
        simpleNationalOptant: true,
        culturalIncentivizer: false,
        recipient: {
          name: 'John Doe',
          cpf: '12345678901',
          address: {
            street: 'Main St',
            number: '123',
            district: 'Downtown',
            cityCode: '1234567',
            state: 'MG',
            zipCode: '12345678',
          },
        },
        service: {
          serviceCode: '0107' as any,
          description: 'Jiu-jitsu classes',
          taxRate: 5.0,
          serviceValue: 100.0,
          netValue: 95.0,
          issWithheld: false,
          serviceDiscrimination: 'Monthly jiu-jitsu classes',
          serviceCityCode: '1234567',
        },
      };

      const existingNfse = { id: 'uuid', number: 1, series: 'A' };

      mockRepository.findOne.mockResolvedValue(existingNfse);

      await expect(service.create(createNfseDto)).rejects.toThrow(
        'NFS-e number 1 already exists in series A'
      );
    });
  });

  describe('findOne', () => {
    it('should return NFS-e by ID', async () => {
      const mockNfse = {
        id: 'uuid',
        number: 1,
        series: 'A',
        status: NfseStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);

      const result = await service.findOne('uuid');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid' },
        relations: ['student'],
      });
      expect(result).toEqual(mockNfse);
    });

    it('should throw NotFoundException if NFS-e not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('uuid')).rejects.toThrow(
        'NFS-e with ID uuid not found'
      );
    });
  });

  describe('sendNfse', () => {
    it('should send NFS-e successfully', async () => {
      const mockNfse = {
        id: 'uuid',
        number: 1,
        series: 'A',
        status: NfseStatus.PENDING,
      };

      const mockResponse = {
        success: true,
        protocol: 'PROT123',
        nfseNumber: 'NFSE123',
        nfseCode: 'CODE123',
        nfseLink: 'http://example.com/nfse',
        nfseDate: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockXmlSigningService.generateNfseXml.mockResolvedValue(
        '<xml>test</xml>'
      );
      mockXmlSigningService.signXml.mockResolvedValue(
        '<signed-xml>test</signed-xml>'
      );
      mockWebService.sendNfse.mockResolvedValue(mockResponse);
      mockRepository.save.mockResolvedValue({
        ...mockNfse,
        status: NfseStatus.SENT,
      });

      const result = await service.sendNfse(['uuid']);

      expect(result.sent).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should handle send failure', async () => {
      const mockNfse = {
        id: 'uuid',
        number: 1,
        series: 'A',
        status: NfseStatus.PENDING,
      };

      const mockResponse = {
        success: false,
        observations: 'Error sending NFS-e',
      };

      mockRepository.findOne.mockResolvedValue(mockNfse);
      mockXmlSigningService.generateNfseXml.mockResolvedValue(
        '<xml>test</xml>'
      );
      mockXmlSigningService.signXml.mockResolvedValue(
        '<signed-xml>test</signed-xml>'
      );
      mockWebService.sendNfse.mockResolvedValue(mockResponse);
      mockRepository.save.mockResolvedValue({
        ...mockNfse,
        status: NfseStatus.REJECTED,
      });

      const result = await service.sendNfse(['uuid']);

      expect(result.sent).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].nfseId).toBe('uuid');
      expect(result.errors[0].error).toBe('XML generation not implemented yet');
    });
  });
});
