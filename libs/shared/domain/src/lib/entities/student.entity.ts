import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StudentStatus, AgeCategory } from '@gym-management/types';
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

