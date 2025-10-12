import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductCategory } from '@gym-management/common';

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  @MaxLength(50)
  sku: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  stockQuantity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  size?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

