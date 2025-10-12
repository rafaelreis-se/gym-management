import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Sale, SaleItem } from '@gym-management/domain';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SalesService } from './sales.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Sale, SaleItem])],
  controllers: [ProductsController],
  providers: [ProductsService, SalesService],
  exports: [ProductsService, SalesService],
})
export class ProductsModule {}

