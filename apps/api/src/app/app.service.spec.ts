import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('AppService', () => {
  let service: AppService;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return API information', () => {
      const result = service.getData();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result.name).toBe('Gym Management API');
    });
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      mockDataSource.query.mockResolvedValue([1]);

      const result = await service.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.status).toBe('ok');
    });
  });
});
