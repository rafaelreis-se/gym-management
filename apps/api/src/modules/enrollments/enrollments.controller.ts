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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@gym-management/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Enrollment } from '@gym-management/domain';
import { StudentsService } from '../students/students.service';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../../common/pagination/pagination.utils';
import { ResponseMessage } from '../../common/interceptors/api-response.interceptor';

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
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment successfully created' })
  @ResponseMessage('Enrollment successfully created')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto
  ): Promise<Enrollment> {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrollments with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Enrollments list successfully retrieved',
  })
  @ResponseMessage('Enrollments list successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponse<Enrollment>> {
    return this.enrollmentsService.findAll(paginationQuery);
  }

  @Get('my-enrollments')
  @ApiOperation({ summary: 'Get my enrollments as student' })
  @ApiResponse({
    status: 200,
    description: 'Student enrollments successfully retrieved',
  })
  @ResponseMessage('Student enrollments successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async findMyEnrollments(@CurrentUser() user: User): Promise<Enrollment[]> {
    if (!user.studentId) {
      throw new ForbiddenException('User is not linked to a student');
    }
    return this.enrollmentsService.findByStudent(user.studentId);
  }

  @Get('my-children-enrollments')
  @ApiOperation({ summary: 'Get my children enrollments as guardian' })
  @ApiResponse({
    status: 200,
    description: 'Children enrollments successfully retrieved',
  })
  @ResponseMessage('Children enrollments successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GUARDIAN)
  async findMyChildrenEnrollments(
    @CurrentUser() user: User
  ): Promise<Enrollment[]> {
    if (!user.guardianId) {
      throw new ForbiddenException('User is not linked to a guardian');
    }

    const children = await this.studentsService.findByGuardian(
      user.guardianId,
      {
        page: 1,
        limit: 1000,
        search: '',
        sortBy: 'name',
        sortOrder: 'ASC',
      }
    );
    const enrollments = await Promise.all(
      children.data.map((child) =>
        this.enrollmentsService.findByStudent(child.id)
      )
    );

    return enrollments.flat();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment successfully retrieved',
  })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ResponseMessage('Enrollment successfully retrieved')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentsService.findOne(id);

    // Check access based on role
    if (user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR) {
      return enrollment;
    }

    if (
      user.role === UserRole.STUDENT &&
      user.studentId === enrollment.studentId
    ) {
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
  @ApiOperation({ summary: 'Get enrollments by student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student enrollments successfully retrieved',
  })
  @ResponseMessage('Student enrollments successfully retrieved')
  async findByStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: User
  ): Promise<Enrollment[]> {
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
  @ApiOperation({ summary: 'Update enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Enrollment successfully updated' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ResponseMessage('Enrollment successfully updated')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto
  ): Promise<Enrollment> {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove enrollment by ID' })
  @ApiResponse({ status: 204, description: 'Enrollment successfully removed' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  @ResponseMessage('Enrollment successfully removed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.enrollmentsService.remove(id);
  }
}
