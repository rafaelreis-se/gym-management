import {
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStudentDto } from './create-student.dto';
import { CreateGuardianDto } from '../../guardians/dto/create-guardian.dto';
import { GuardianRelationship } from '@gym-management/common';

export class GuardianRelationshipDto {
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
}

export class CreateStudentWithGuardianDto {
  @ValidateNested()
  @Type(() => CreateStudentDto)
  student: CreateStudentDto;

  @ValidateNested()
  @Type(() => CreateGuardianDto)
  @IsOptional()
  guardian?: CreateGuardianDto;

  @ValidateNested()
  @Type(() => GuardianRelationshipDto)
  @IsOptional()
  guardianRelationship?: GuardianRelationshipDto;
}

