import {
  IsString,
  IsEnum,
  IsDate,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BeltColor, BeltDegree, Modality } from '@gym-management/common';

export class CreateGraduationDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsEnum(Modality)
  modality: Modality;

  @IsEnum(BeltColor)
  beltColor: BeltColor;

  @IsEnum(BeltDegree)
  beltDegree: BeltDegree;

  @IsDate()
  @Type(() => Date)
  graduationDate: Date;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  grantedBy?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

