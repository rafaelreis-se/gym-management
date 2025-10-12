import { Repository } from 'typeorm';
import { BaseRepository } from './repository.abstract';

interface TestEntity {
  id: number;
  name: string;
}

class TestRepository extends BaseRepository<TestEntity> {}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockTypeOrmRepository: Partial<Repository<TestEntity>>;

  beforeEach(() => {
    mockTypeOrmRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    repository = new TestRepository(
      mockTypeOrmRepository as Repository<TestEntity>
    );
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      const entities = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];
      (mockTypeOrmRepository.find as jest.Mock).mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toEqual(entities);
      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return entity by id', async () => {
      const entity = { id: 1, name: 'Test' };
      (mockTypeOrmRepository.findOne as jest.Mock).mockResolvedValue(entity);

      const result = await repository.findById(1);

      expect(result).toEqual(entity);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: undefined,
      });
    });

    it('should return null if entity not found', async () => {
      (mockTypeOrmRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findPaginated', () => {
    it('should return paginated results', async () => {
      const entities = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];
      (mockTypeOrmRepository.findAndCount as jest.Mock).mockResolvedValue([
        entities,
        50,
      ]);

      const result = await repository.findPaginated({ page: 1, limit: 10 });

      expect(result.data).toEqual(entities);
      expect(result.meta.total).toBe(50);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const entity = { name: 'Test' };
      const createdEntity = { id: 1, name: 'Test' };

      (mockTypeOrmRepository.create as jest.Mock).mockReturnValue(
        createdEntity
      );
      (mockTypeOrmRepository.save as jest.Mock).mockResolvedValue(
        createdEntity
      );

      const result = await repository.create(entity);

      expect(result).toEqual(createdEntity);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(entity);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(createdEntity);
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const updatedEntity = { id: 1, name: 'Updated' };

      (mockTypeOrmRepository.update as jest.Mock).mockResolvedValue({
        affected: 1,
      });
      (mockTypeOrmRepository.findOne as jest.Mock).mockResolvedValue(
        updatedEntity
      );

      const result = await repository.update(1, { name: 'Updated' });

      expect(result).toEqual(updatedEntity);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(1, {
        name: 'Updated',
      });
    });
  });

  describe('remove', () => {
    it('should remove an entity and return true', async () => {
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({
        affected: 1,
      });

      const result = await repository.remove(1);

      expect(result).toBe(true);
      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if no entity was affected', async () => {
      (mockTypeOrmRepository.delete as jest.Mock).mockResolvedValue({
        affected: 0,
      });

      const result = await repository.remove(999);

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return count of entities', async () => {
      (mockTypeOrmRepository.count as jest.Mock).mockResolvedValue(42);

      const result = await repository.count();

      expect(result).toBe(42);
      expect(mockTypeOrmRepository.count).toHaveBeenCalled();
    });
  });
});
