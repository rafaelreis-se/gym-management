import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus } from '@gym-management/types';
import { Student } from './student.entity';
import { SaleItem } from './sale-item.entity';

/**
 * Product sales transactions
 */
@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  studentId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;
}

