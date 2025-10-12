import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlanType, Modality } from '@gym-management/types';

/**
 * Membership plans offered by the gym
 */
@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PlanType,
  })
  type: PlanType;

  @Column({
    type: 'enum',
    enum: Modality,
    array: true,
  })
  modalities: Modality[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  durationMonths: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

