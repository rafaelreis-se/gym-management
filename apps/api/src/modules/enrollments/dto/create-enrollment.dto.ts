import { IsEnum, IsDate, IsUUID, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Modality } from '@gym-management/common';

export class CreateEnrollmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @IsEnum(Modality)
  modality: Modality;

  @IsDate()
  @Type(() => Date)
  startDate: Date;
}

