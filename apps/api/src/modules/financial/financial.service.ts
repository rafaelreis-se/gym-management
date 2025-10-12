import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Payment } from '@gym-management/domain';
import { PaymentStatus } from '@gym-management/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class FinancialService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['enrollment', 'enrollment.student'],
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['enrollment', 'enrollment.student'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByEnrollment(enrollmentId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { enrollmentId },
      order: { dueDate: 'ASC' },
    });
  }

  async findOverdue(): Promise<Payment[]> {
    const today = new Date();
    return this.paymentRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: LessThan(today),
      },
      relations: ['enrollment', 'enrollment.student'],
    });
  }

  async findPendingPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { status: PaymentStatus.PENDING },
      relations: ['enrollment', 'enrollment.student'],
      order: { dueDate: 'ASC' },
    });
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async markAsPaid(id: string, paymentDate: Date, paymentMethod: string): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = PaymentStatus.PAID;
    payment.paymentDate = paymentDate;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payment.paymentMethod = paymentMethod as any;
    return this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
}

