import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from './product.entity';

/**
 * Individual items within a sale transaction
 */
@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  saleId: string;

  @ManyToOne(() => Sale, (sale) => sale.items)
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;
}

