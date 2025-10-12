import { PaginatedResult, PaginationOptions } from '../interfaces';

/**
 * Creates a standardized paginated response
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginatedResult<T> {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Calculates skip and take parameters for TypeORM
 */
export function getPaginationParams(options: PaginationOptions) {
  const { page, limit } = options;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

