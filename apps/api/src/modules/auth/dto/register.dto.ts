import {
  IsEmail,
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { UserRole } from '@gym-management/common';

export class RegisterDto {
  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsUUID()
  @IsOptional()
  guardianId?: string;
}

