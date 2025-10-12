import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from '@gym-management/types';

/**
 * Sports products sold by the gym
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category: ProductCategory;

  @Column({ length: 50, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ length: 20, nullable: true })
  size: string;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

