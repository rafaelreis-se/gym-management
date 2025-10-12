import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus } from '@gym-management/types';
import { Enrollment } from './enrollment.entity';

/**
 * Payments and installments for memberships
 */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  enrollmentId: string;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.payments)
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'int' })
  installmentNumber: number;

  @Column({ type: 'int' })
  totalInstallments: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

