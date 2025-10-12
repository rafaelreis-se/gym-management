import { createPaginatedResult, getPaginationParams } from './pagination.utils';

describe('Pagination Utils', () => {
  describe('createPaginatedResult', () => {
    it('should create a paginated result with correct meta data', () => {
      const data = [1, 2, 3, 4, 5];
      const total = 50;
      const options = { page: 1, limit: 10 };

      const result = createPaginatedResult(data, total, options);

      expect(result.data).toEqual(data);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(50);
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('should calculate hasNextPage correctly on last page', () => {
      const data = [1, 2, 3];
      const total = 23;
      const options = { page: 3, limit: 10 };

      const result = createPaginatedResult(data, total, options);

      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should calculate hasPreviousPage correctly', () => {
      const data = [1, 2, 3];
      const total = 30;
      const options = { page: 2, limit: 10 };

      const result = createPaginatedResult(data, total, options);

      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should handle single page correctly', () => {
      const data = [1, 2, 3];
      const total = 3;
      const options = { page: 1, limit: 10 };

      const result = createPaginatedResult(data, total, options);

      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });
  });

  describe('getPaginationParams', () => {
    it('should calculate correct skip and take for first page', () => {
      const options = { page: 1, limit: 10 };

      const result = getPaginationParams(options);

      expect(result.skip).toBe(0);
      expect(result.take).toBe(10);
    });

    it('should calculate correct skip and take for second page', () => {
      const options = { page: 2, limit: 10 };

      const result = getPaginationParams(options);

      expect(result.skip).toBe(10);
      expect(result.take).toBe(10);
    });

    it('should calculate correct skip and take for any page', () => {
      const options = { page: 5, limit: 20 };

      const result = getPaginationParams(options);

      expect(result.skip).toBe(80);
      expect(result.take).toBe(20);
    });
  });
});
