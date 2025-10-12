import { IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@gym-management/common';

export class MarkAsPaidDto {
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @IsEnum(PaymentMethod)
  paymentMethod: string;
}

