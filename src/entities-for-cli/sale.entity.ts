
// Enums definidos localmente para evitar dependências
enum UserRole {
  ADMIN = 'admin',
  INSTRUCTOR = 'instructor',
  GUARDIAN = 'guardian',
  STUDENT = 'student'
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
  PIX = 'pix'
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

enum GraduationLevel {
  WHITE = 'white',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  GREEN = 'green',
  BLUE = 'blue',
  PURPLE = 'purple',
  BROWN = 'brown',
  BLACK = 'black'
}

enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

enum AgeCategory {
  KIDS = 'kids',
  TEENS = 'teens',
  ADULTS = 'adults'
}

enum GuardianRelationship {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  OTHER = 'other'
}

enum Modality {
  BRAZILIAN_JIU_JITSU = 'bjj',
  MUAY_THAI = 'muay_thai',
  MMA = 'mma',
  FITNESS = 'fitness'
}

enum BeltColor {
  WHITE = 'white',
  BLUE = 'blue',
  PURPLE = 'purple',
  BROWN = 'brown',
  BLACK = 'black'
}

enum BeltDegree {
  NONE = 0,
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4
}

enum PlanType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual'
}

enum ProductCategory {
  EQUIPMENT = 'equipment',
  APPAREL = 'apparel',
  SUPPLEMENTS = 'supplements',
  ACCESSORIES = 'accessories'
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
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

