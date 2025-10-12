import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { Payment } from '@gym-management/domain';
import { NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '@gym-management/common';

describe('FinancialService', () => {
  let service: FinancialService;

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const createDto: any = {
        enrollmentId: '1',
        amount: 100,
        dueDate: new Date(),
        status: PaymentStatus.PENDING,
        installmentNumber: 1,
        totalInstallments: 12,
      };

      const payment = { id: '1', ...createDto };

      mockPaymentRepository.create.mockReturnValue(payment);
      mockPaymentRepository.save.mockResolvedValue(payment);

      const result = await service.create(createDto);

      expect(result).toEqual(payment);
      expect(mockPaymentRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(payment);
    });
  });

  describe('findOne', () => {
    it('should return a payment by id', async () => {
      const payment = { id: '1', amount: 100 };

      mockPaymentRepository.findOne.mockResolvedValue(payment);

      const result = await service.findOne('1');

      expect(result).toEqual(payment);
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('findAll', () => {
    it('should return all payments', async () => {
      const payments = [
        { id: '1', amount: 100 },
        { id: '2', amount: 200 },
      ];

      mockPaymentRepository.find.mockResolvedValue(payments);

      const result = await service.findAll();

      expect(result).toEqual(payments);
      expect(mockPaymentRepository.find).toHaveBeenCalled();
    });
  });

  describe('findPendingPayments', () => {
    it('should return pending payments', async () => {
      const payments = [
        { id: '1', amount: 100, status: PaymentStatus.PENDING },
      ];

      mockPaymentRepository.find.mockResolvedValue(payments);

      const result = await service.findPendingPayments();

      expect(result).toEqual(payments);
      expect(mockPaymentRepository.find).toHaveBeenCalledWith({
        where: { status: PaymentStatus.PENDING },
        relations: ['enrollment', 'enrollment.student'],
        order: { dueDate: 'ASC' },
      });
    });
  });

  describe('markAsPaid', () => {
    it('should mark payment as paid', async () => {
      const payment = {
        id: '1',
        amount: 100,
        status: PaymentStatus.PENDING,
      };

      const paymentDate = new Date();
      const updatedPayment = {
        ...payment,
        status: PaymentStatus.PAID,
        paymentDate,
        paymentMethod: 'CREDIT_CARD',
      };

      mockPaymentRepository.findOne.mockResolvedValue(payment);
      mockPaymentRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.markAsPaid('1', paymentDate, 'CREDIT_CARD');

      expect(result.status).toBe(PaymentStatus.PAID);
      expect(result.paymentDate).toBe(paymentDate);
    });
  });
});
