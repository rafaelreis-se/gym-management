import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '@gym-management/common';

class SaleItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateSaleDto {
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

