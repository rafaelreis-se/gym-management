import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@gym-management/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@gym-management/domain';
import { StudentsService } from '../students/students.service';

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly studentsService: StudentsService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll() {
    return this.enrollmentsService.findAll();
  }

  @Get('my-enrollments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async findMyEnrollments(@CurrentUser() user: User) {
    if (!user.studentId) {
      throw new ForbiddenException('User is not linked to a student');
    }
    return this.enrollmentsService.findByStudent(user.studentId);
  }

  @Get('my-children-enrollments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GUARDIAN)
  async findMyChildrenEnrollments(@CurrentUser() user: User) {
    if (!user.guardianId) {
      throw new ForbiddenException('User is not linked to a guardian');
    }
    
    const children = await this.studentsService.findByGuardian(user.guardianId);
    const enrollments = await Promise.all(
      children.map((child) => this.enrollmentsService.findByStudent(child.id))
    );
    
    return enrollments.flat();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const enrollment = await this.enrollmentsService.findOne(id);
    
    // Check access based on role
    if (user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR) {
      return enrollment;
    }
    
    if (user.role === UserRole.STUDENT && user.studentId === enrollment.studentId) {
      return enrollment;
    }
    
    if (user.role === UserRole.GUARDIAN && user.guardianId) {
      const hasAccess = await this.studentsService.guardianHasAccessToStudent(
        user.guardianId,
        enrollment.studentId
      );
      if (hasAccess) {
        return enrollment;
      }
    }
    
    throw new ForbiddenException('Access denied to this enrollment');
  }

  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: User
  ) {
    // Admins and instructors can see any
    if (user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR) {
      return this.enrollmentsService.findByStudent(studentId);
    }

    // Students can only see their own
    if (user.role === UserRole.STUDENT && user.studentId === studentId) {
      return this.enrollmentsService.findByStudent(studentId);
    }

    // Guardians can see their children's
    if (user.role === UserRole.GUARDIAN && user.guardianId) {
      const hasAccess = await this.studentsService.guardianHasAccessToStudent(
        user.guardianId,
        studentId
      );
      if (hasAccess) {
        return this.enrollmentsService.findByStudent(studentId);
      }
    }

    throw new ForbiddenException('Access denied');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto
  ) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}
