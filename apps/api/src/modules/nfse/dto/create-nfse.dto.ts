import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@gym-management/types';

export class CreateAddressDto {
  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  district: string;

  @IsString()
  cityCode: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;
}

export class CreateRecipientDto {
  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  municipalInscription?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;
}

export class CreateServiceDto {
  @IsEnum(ServiceType)
  serviceCode: ServiceType;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;

  @IsNumber()
  @Min(0)
  serviceValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductionValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pisValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cofinsValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inssValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  irValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  csllValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  issValue?: number;

  @IsNumber()
  @Min(0)
  netValue: number;

  @IsBoolean()
  issWithheld: boolean;

  @IsString()
  serviceDiscrimination: string;

  @IsString()
  serviceCityCode: string;

  @IsOptional()
  @IsString()
  municipalTaxationCode?: string;
}

export class CreateNfseDto {
  @IsNumber()
  number: number;

  @IsString()
  series: string;

  @IsNumber()
  type: number;

  @IsDateString()
  emissionDate: string;

  @IsNumber()
  operationNature: number;

  @IsOptional()
  @IsNumber()
  specialTaxRegime?: number;

  @IsBoolean()
  simpleNationalOptant: boolean;

  @IsBoolean()
  culturalIncentivizer: boolean;

  @ValidateNested()
  @Type(() => CreateRecipientDto)
  recipient: CreateRecipientDto;

  @ValidateNested()
  @Type(() => CreateServiceDto)
  service: CreateServiceDto;

  @IsOptional()
  @IsString()
  studentId?: string;
}
