import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BeltColor, BeltDegree, Modality } from '@gym-management/types';
import { Student } from './student.entity';

/**
 * Student graduation history (belts and degrees)
 */
@Entity('graduations')
export class Graduation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  studentId: string;

  @ManyToOne(() => Student, (student) => student.graduations)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({
    type: 'enum',
    enum: Modality,
  })
  modality: Modality;

  @Column({
    type: 'enum',
    enum: BeltColor,
  })
  beltColor: BeltColor;

  @Column({
    type: 'enum',
    enum: BeltDegree,
    default: BeltDegree.NONE,
  })
  beltDegree: BeltDegree;

  @Column({ type: 'date' })
  graduationDate: Date;

  @Column({ length: 255, nullable: true })
  grantedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}

