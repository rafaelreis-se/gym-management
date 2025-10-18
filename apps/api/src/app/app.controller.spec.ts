import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

describe('AppController', () => {
  let app: TestingModule;

  const mockDataSource = {
    query: jest.fn().mockResolvedValue([{ version: '1.0' }]),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();
  });

  describe('getData', () => {
    it('should return API information', () => {
      const appController = app.get<AppController>(AppController);
      const result = appController.getData();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('description');
      expect(result.name).toBe('Gym Management API');
    });
  });
});
