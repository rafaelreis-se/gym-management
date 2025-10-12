import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SalesService } from './sales.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly salesService: SalesService
  ) {}

  // Products endpoints
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAllProducts() {
    return this.productsService.findAll();
  }

  @Get('active')
  findActiveProducts() {
    return this.productsService.findActive();
  }

  @Get('low-stock')
  findLowStock(@Query('threshold') threshold?: number) {
    return this.productsService.findLowStock(threshold);
  }

  @Get(':id')
  findOneProduct(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.productsService.updateStock(id, updateStockDto.quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProduct(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // Sales endpoints
  @Post('sales')
  @HttpCode(HttpStatus.CREATED)
  createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get('sales')
  findAllSales() {
    return this.salesService.findAll();
  }

  @Get('sales/:id')
  findOneSale(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Get('sales/student/:studentId')
  findSalesByStudent(@Param('studentId') studentId: string) {
    return this.salesService.findByStudent(studentId);
  }
}

