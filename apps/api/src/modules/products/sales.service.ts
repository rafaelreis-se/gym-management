import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, SaleItem } from '@gym-management/domain';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from './products.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    private readonly productsService: ProductsService
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Verify stock and calculate totals
    let totalAmount = 0;
    const saleItems: SaleItem[] = [];

    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productId);

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      const saleItem = this.saleItemRepository.create({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });

      saleItems.push(saleItem);
    }

    const finalAmount = totalAmount - (createSaleDto.discountAmount || 0);

    // Create sale
    const sale = this.saleRepository.create({
      studentId: createSaleDto.studentId,
      totalAmount,
      discountAmount: createSaleDto.discountAmount || 0,
      finalAmount,
      paymentMethod: createSaleDto.paymentMethod,
      paymentStatus: createSaleDto.paymentStatus,
      notes: createSaleDto.notes,
      items: saleItems,
    });

    const savedSale = await this.saleRepository.save(sale);

    // Update stock
    for (const item of createSaleDto.items) {
      await this.productsService.updateStock(item.productId, -item.quantity);
    }

    return savedSale;
  }

  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find({
      relations: ['student', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['student', 'items', 'items.product'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async findByStudent(studentId: string): Promise<Sale[]> {
    return this.saleRepository.find({
      where: { studentId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
}
