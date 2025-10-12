import {
  IsUUID,
  IsNumber,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, PaymentMethod } from '@gym-management/common';

export class CreatePaymentDto {
  @IsUUID()
  enrollmentId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsInt()
  @Min(1)
  installmentNumber: number;

  @IsInt()
  @Min(1)
  totalInstallments: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

