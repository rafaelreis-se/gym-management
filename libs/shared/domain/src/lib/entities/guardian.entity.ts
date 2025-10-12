import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StudentGuardian } from './student-guardian.entity';

/**
 * Guardian entity - represents a legal guardian or responsible person
 * Can be linked to multiple students (e.g., parent of multiple children)
 */
@Entity('guardians')
export class Guardian {
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

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 20, nullable: true })
  alternativePhone: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 2, nullable: true })
  state: string;

  @Column({ length: 10, nullable: true })
  zipCode: string;

  @Column({ length: 100, nullable: true })
  profession: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => StudentGuardian, (studentGuardian) => studentGuardian.guardian)
  studentGuardians: StudentGuardian[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

