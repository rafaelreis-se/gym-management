
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
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from './student.entity';
import { Guardian } from './guardian.entity';
import { RefreshToken } from './refresh-token.entity';

/**
 * User entity for authentication and authorization
 * Can be linked to either a Student or Guardian
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255, nullable: true })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ length: 255, nullable: true })
  providerId: string;

  @Column({ type: 'boolean', default: false })
  isFirstAccess: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column('uuid', { nullable: true })
  studentId: string;

  @OneToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column('uuid', { nullable: true })
  guardianId: string;

  @OneToOne(() => Guardian, { nullable: true })
  @JoinColumn({ name: 'guardianId' })
  guardian: Guardian;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

