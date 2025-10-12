import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from '@gym-management/domain';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto: any = {
        name: 'Test Product',
        sku: 'TEST-001',
        category: 'APPAREL',
        price: 100,
        stockQuantity: 50,
      };

      const product = { id: '1', ...createDto };

      mockProductRepository.create.mockReturnValue(product);
      mockProductRepository.save.mockResolvedValue(product);

      const result = await service.create(createDto);

      expect(result).toEqual(product);
      expect(mockProductRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(product);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: '1', name: 'Test Product' };

      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne('1');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ];

      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockProductRepository.find).toHaveBeenCalled();
    });
  });

  describe('findActive', () => {
    it('should return only active products', async () => {
      const products = [{ id: '1', name: 'Active Product', isActive: true }];

      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findActive();

      expect(result).toEqual(products);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const product = {
        id: '1',
        name: 'Test Product',
        stockQuantity: 50,
      };

      const updatedProduct = {
        ...product,
        stockQuantity: 60,
      };

      mockProductRepository.findOne.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.updateStock('1', 10);

      expect(result.stockQuantity).toBe(60);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('findBySku', () => {
    it('should return a product by SKU', async () => {
      const product = { id: '1', name: 'Test Product', sku: 'TEST-001' };

      mockProductRepository.findOne.mockResolvedValue(product);

      const result = await service.findBySku('TEST-001');

      expect(result).toEqual(product);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { sku: 'TEST-001' },
      });
    });
  });
});
