import {
  IsString,
  IsEmail,
  IsDate,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Length,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudentStatus, AgeCategory } from '@gym-management/common';

export class CreateStudentDto {
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
  @Type(() => Date)
  birthDate: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  emergencyPhone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  zipCode: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsEnum(AgeCategory)
  ageCategory: AgeCategory;

  @IsString()
  @IsOptional()
  medicalObservations?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

