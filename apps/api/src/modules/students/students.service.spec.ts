import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { Student } from '@gym-management/domain';
import { NotFoundException } from '@nestjs/common';

describe('StudentsService', () => {
  let service: StudentsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new student', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createDto = { fullName: 'John Doe' } as any;
      const student = { id: '1', ...createDto };

      mockRepository.create.mockReturnValue(student);
      mockRepository.save.mockResolvedValue(student);

      const result = await service.create(createDto);

      expect(result).toEqual(student);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(student);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when student not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});

