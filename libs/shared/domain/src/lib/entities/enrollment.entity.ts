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
import { Modality } from '@gym-management/types';
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

