import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePaymentDto } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  paymentDate?: Date;
}

