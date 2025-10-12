import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { GuardianRelationship } from '@gym-management/types';
import { Student } from './student.entity';
import { Guardian } from './guardian.entity';

/**
 * Student-Guardian relationship entity
 * Represents the relationship between a student and their guardian
 * Includes financial responsibility flag
 */
@Entity('student_guardians')
export class StudentGuardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  studentId: string;

  @ManyToOne(() => Student, (student) => student.studentGuardians)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column('uuid')
  guardianId: string;

  @ManyToOne(() => Guardian, (guardian) => guardian.studentGuardians)
  @JoinColumn({ name: 'guardianId' })
  guardian: Guardian;

  @Column({
    type: 'enum',
    enum: GuardianRelationship,
  })
  relationship: GuardianRelationship;

  @Column({ type: 'boolean', default: false })
  isFinanciallyResponsible: boolean;

  @Column({ type: 'boolean', default: true })
  isEmergencyContact: boolean;

  @Column({ type: 'boolean', default: true })
  canPickUp: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}

