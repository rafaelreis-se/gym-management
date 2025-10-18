
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
  OneToMany,
} from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { Graduation } from './graduation.entity';
import { StudentGuardian } from './student-guardian.entity';

/**
 * Student entity - represents a gym member
 */
@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20, unique: true })
  cpf: string;

  @Column({ length: 20, nullable: true })
  rg: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 20, nullable: true })
  emergencyPhone: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 2 })
  state: string;

  @Column({ length: 10 })
  zipCode: string;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  @Column({
    type: 'enum',
    enum: AgeCategory,
  })
  ageCategory: AgeCategory;

  @Column({ type: 'text', nullable: true })
  medicalObservations: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Graduation, (graduation) => graduation.student)
  graduations: Graduation[];

  @OneToMany(() => StudentGuardian, (studentGuardian) => studentGuardian.student)
  studentGuardians: StudentGuardian[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

