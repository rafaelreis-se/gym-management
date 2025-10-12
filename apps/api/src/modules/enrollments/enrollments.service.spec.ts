import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnrollmentsService } from './enrollments.service';
import { Enrollment } from '@gym-management/domain';
import { NotFoundException } from '@nestjs/common';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  const mockEnrollmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        {
          provide: getRepositoryToken(Enrollment),
          useValue: mockEnrollmentRepository,
        },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new enrollment', async () => {
      const createDto: any = {
        studentId: '1',
        planId: '1',
        modality: 'GI',
        startDate: new Date(),
      };

      const enrollment = { id: '1', ...createDto };

      mockEnrollmentRepository.create.mockReturnValue(enrollment);
      mockEnrollmentRepository.save.mockResolvedValue(enrollment);

      const result = await service.create(createDto);

      expect(result).toEqual(enrollment);
      expect(mockEnrollmentRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockEnrollmentRepository.save).toHaveBeenCalledWith(enrollment);
    });
  });

  describe('findOne', () => {
    it('should return an enrollment by id', async () => {
      const enrollment = { id: '1', studentId: '1' };

      mockEnrollmentRepository.findOne.mockResolvedValue(enrollment);

      const result = await service.findOne('1');

      expect(result).toEqual(enrollment);
    });

    it('should throw NotFoundException when enrollment not found', async () => {
      mockEnrollmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('should return all enrollments', async () => {
      const enrollments = [
        { id: '1', studentId: '1' },
        { id: '2', studentId: '2' },
      ];

      mockEnrollmentRepository.find.mockResolvedValue(enrollments);

      const result = await service.findAll();

      expect(result).toEqual(enrollments);
      expect(mockEnrollmentRepository.find).toHaveBeenCalled();
    });
  });

  describe('findByStudent', () => {
    it('should return enrollments for a student', async () => {
      const enrollments = [{ id: '1', studentId: '1' }];

      mockEnrollmentRepository.find.mockResolvedValue(enrollments);

      const result = await service.findByStudent('1');

      expect(result).toEqual(enrollments);
      expect(mockEnrollmentRepository.find).toHaveBeenCalledWith({
        where: { studentId: '1' },
        relations: ['plan', 'payments'],
      });
    });
  });

  describe('update', () => {
    it('should update an enrollment', async () => {
      const enrollment = { id: '1', studentId: '1' };
      const updateDto = { planId: '2' };
      const updatedEnrollment = { ...enrollment, ...updateDto };

      mockEnrollmentRepository.findOne.mockResolvedValue(enrollment);
      mockEnrollmentRepository.save.mockResolvedValue(updatedEnrollment);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedEnrollment);
      expect(mockEnrollmentRepository.save).toHaveBeenCalled();
    });
  });
});
