import {
  IsString,
  IsEnum,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  MaxLength,
  Min,
} from 'class-validator';
import { PlanType, Modality } from '@gym-management/common';

export class CreatePlanDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PlanType)
  type: PlanType;

  @IsArray()
  @IsEnum(Modality, { each: true })
  modalities: Modality[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  durationMonths: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  discountPercentage?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

