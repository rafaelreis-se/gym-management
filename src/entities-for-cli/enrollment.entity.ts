
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
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from './student.entity';
import { Plan } from './plan.entity';
import { Payment } from './payment.entity';

/**
 * Student enrollment in a specific modality
 */
@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  studentId: string;

  @ManyToOne(() => Student, (student) => student.enrollments)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column('uuid')
  planId: string;

  @ManyToOne(() => Plan)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @Column({
    type: 'enum',
    enum: Modality,
  })
  modality: Modality;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Payment, (payment) => payment.enrollment)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

