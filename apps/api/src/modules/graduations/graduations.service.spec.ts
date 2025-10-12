import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GraduationsService } from './graduations.service';
import { Graduation } from '@gym-management/domain';
import { NotFoundException } from '@nestjs/common';

describe('GraduationsService', () => {
  let service: GraduationsService;

  const mockGraduationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraduationsService,
        {
          provide: getRepositoryToken(Graduation),
          useValue: mockGraduationRepository,
        },
      ],
    }).compile();

    service = module.get<GraduationsService>(GraduationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new graduation', async () => {
      const createDto: any = {
        studentId: '1',
        modality: 'GI',
        beltColor: 'BLUE',
        beltDegree: 'NONE',
        graduationDate: new Date(),
      };

      const graduation = { id: '1', ...createDto };

      mockGraduationRepository.create.mockReturnValue(graduation);
      mockGraduationRepository.save.mockResolvedValue(graduation);

      const result = await service.create(createDto);

      expect(result).toEqual(graduation);
      expect(mockGraduationRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockGraduationRepository.save).toHaveBeenCalledWith(graduation);
    });
  });

  describe('findOne', () => {
    it('should return a graduation by id', async () => {
      const graduation = { id: '1', studentId: '1' };

      mockGraduationRepository.findOne.mockResolvedValue(graduation);

      const result = await service.findOne('1');

      expect(result).toEqual(graduation);
    });

    it('should throw NotFoundException when graduation not found', async () => {
      mockGraduationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('should return all graduations', async () => {
      const graduations = [
        { id: '1', studentId: '1' },
        { id: '2', studentId: '2' },
      ];

      mockGraduationRepository.find.mockResolvedValue(graduations);

      const result = await service.findAll();

      expect(result).toEqual(graduations);
      expect(mockGraduationRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByStudent', () => {
    it('should return graduations for a student', async () => {
      const graduations = [{ id: '1', studentId: '1' }];

      mockGraduationRepository.find.mockResolvedValue(graduations);

      const result = await service.findByStudent('1');

      expect(result).toEqual(graduations);
      expect(mockGraduationRepository.find).toHaveBeenCalledWith({
        where: { studentId: '1' },
        order: { graduationDate: 'DESC' },
      });
    });
  });

  describe('getCurrentGraduation', () => {
    it('should return the current graduation for a student', async () => {
      const graduation = { id: '1', studentId: '1', newBeltColor: 'BLUE' };

      mockGraduationRepository.findOne.mockResolvedValue(graduation);

      const result = await service.getCurrentGraduation('1');

      expect(result).toEqual(graduation);
      expect(mockGraduationRepository.findOne).toHaveBeenCalledWith({
        where: { studentId: '1' },
        order: { graduationDate: 'DESC' },
      });
    });
  });
});
