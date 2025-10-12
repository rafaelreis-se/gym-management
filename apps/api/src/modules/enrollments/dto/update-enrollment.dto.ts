import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEnrollmentDto } from './create-enrollment.dto';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

