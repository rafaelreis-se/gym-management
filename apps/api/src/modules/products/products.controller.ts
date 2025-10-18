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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SalesService } from './sales.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Product, Sale } from '@gym-management/domain';
import { ResponseMessage } from '../../common/interceptors/api-response.interceptor';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@gym-management/common';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../../common/pagination/pagination.utils';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly salesService: SalesService
  ) {}

  // Products endpoints
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @ResponseMessage('Product successfully created')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products list successfully retrieved',
  })
  @ResponseMessage('Products list successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllProducts(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active products' })
  @ApiResponse({
    status: 200,
    description: 'Active products successfully retrieved',
  })
  @ResponseMessage('Active products successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findActiveProducts(): Promise<Product[]> {
    return this.productsService.findActive();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({
    status: 200,
    description: 'Low stock products successfully retrieved',
  })
  @ResponseMessage('Low stock products successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findLowStock(@Query('threshold') threshold?: number): Promise<Product[]> {
    return this.productsService.findLowStock(threshold);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product successfully retrieved' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ResponseMessage('Product successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOneProduct(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiResponse({ status: 200, description: 'Product successfully updated' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ResponseMessage('Product successfully updated')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiResponse({
    status: 200,
    description: 'Product stock successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ResponseMessage('Product stock successfully updated')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto
  ): Promise<Product> {
    return this.productsService.updateStock(id, updateStockDto.quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove product by ID' })
  @ApiResponse({ status: 204, description: 'Product successfully removed' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ResponseMessage('Product successfully removed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  removeProduct(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  // Sales endpoints
  @Post('sales')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new sale' })
  @ApiResponse({ status: 201, description: 'Sale successfully created' })
  @ResponseMessage('Sale successfully created')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createSale(@Body() createSaleDto: CreateSaleDto): Promise<Sale> {
    return this.salesService.create(createSaleDto);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get all sales with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Sales list successfully retrieved',
  })
  @ResponseMessage('Sales list successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllSales(): Promise<Sale[]> {
    return this.salesService.findAll();
  }

  @Get('sales/:id')
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale successfully retrieved' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  @ResponseMessage('Sale successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOneSale(@Param('id') id: string): Promise<Sale> {
    return this.salesService.findOne(id);
  }

  @Get('sales/student/:studentId')
  @ApiOperation({ summary: 'Get sales by student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student sales successfully retrieved',
  })
  @ResponseMessage('Student sales successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findSalesByStudent(@Param('studentId') studentId: string): Promise<Sale[]> {
    return this.salesService.findByStudent(studentId);
  }
}
