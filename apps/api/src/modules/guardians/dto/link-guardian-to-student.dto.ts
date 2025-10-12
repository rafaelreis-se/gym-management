import {
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { GuardianRelationship } from '@gym-management/common';

export class LinkGuardianToStudentDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  guardianId: string;

  @IsEnum(GuardianRelationship)
  relationship: GuardianRelationship;

  @IsBoolean()
  @IsOptional()
  isFinanciallyResponsible?: boolean;

  @IsBoolean()
  @IsOptional()
  isEmergencyContact?: boolean;

  @IsBoolean()
  @IsOptional()
  canPickUp?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

