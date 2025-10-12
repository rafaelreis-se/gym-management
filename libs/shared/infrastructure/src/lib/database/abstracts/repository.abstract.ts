import { Repository, FindOptionsWhere, FindManyOptions, ObjectLiteral } from 'typeorm';
import {
  PaginatedResult,
  PaginationOptions,
  createPaginatedResult,
  getPaginationParams,
} from '@gym-management/common';

/**
 * Abstract base repository with common methods
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Find with pagination
   */
  async findPaginated(
    options: PaginationOptions,
    findOptions?: FindManyOptions<T>
  ): Promise<PaginatedResult<T>> {
    const { skip, take } = getPaginationParams(options);

    const [data, total] = await this.repository.findAndCount({
      ...findOptions,
      skip,
      take,
    });

    return createPaginatedResult(data, total, options);
  }

  /**
   * Find all entities
   */
  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * Find entity by ID
   */
  async findById(id: string | number, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations,
    });
  }

  /**
   * Create a new entity
   */
  async create(entity: Partial<T>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = this.repository.create(entity as any);
    return this.repository.save(created) as unknown as Promise<T>;
  }

  /**
   * Update an existing entity
   */
  async update(id: string | number, entity: Partial<T>): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.repository.update(id as any, entity as any);
    return this.findById(id);
  }

  /**
   * Remove an entity
   */
  async remove(id: string | number): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.repository.delete(id as any);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Count entities
   */
  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }
}

