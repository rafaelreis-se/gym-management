import {
  IsString,
  IsEmail,
  IsDate,
  IsOptional,
  IsNotEmpty,
  Length,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGuardianDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  cpf: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  rg?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  birthDate?: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  alternativePhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @Length(2, 2)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  zipCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  profession?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

