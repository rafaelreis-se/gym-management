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
import { UserRole, AuthProvider } from '@gym-management/types';
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

