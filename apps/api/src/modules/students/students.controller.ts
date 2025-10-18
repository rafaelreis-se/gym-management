import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentWithGuardianDto } from './dto/create-student-with-guardian.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@gym-management/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, Student } from '@gym-management/domain';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../../common/pagination/pagination.utils';
import { ResponseMessage } from '../../common/interceptors/api-response.interceptor';

@ApiTags('students')
@ApiBearerAuth()
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new student (Admin only)' })
  @ApiResponse({ status: 201, description: 'Student created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ResponseMessage('Student created successfully')
  async create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.create(createStudentDto);
  }

  @Post('with-guardian')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create student with guardian (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Student and guardian created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ResponseMessage('Student and guardian created successfully')
  async createWithGuardian(
    @Body() createDto: CreateStudentWithGuardianDto
  ): Promise<{ student: Student; guardianId?: string }> {
    return this.studentsService.createWithGuardian(createDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'List all students (Admin/Instructor only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of students' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ResponseMessage('Students retrieved successfully')
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Req() req: Request
  ): Promise<PaginatedResponse<Student>> {
    return this.studentsService.findAll(paginationQuery, req.url);
  }

  @Get('my-children')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GUARDIAN)
  @ApiOperation({ summary: 'Get all children for current guardian' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of children under guardianship',
  })
  @ResponseMessage('Children retrieved successfully')
  async findMyChildren(
    @CurrentUser() user: User,
    @Query() paginationQuery: PaginationQueryDto,
    @Req() req: Request
  ): Promise<PaginatedResponse<Student>> {
    if (!user.guardianId) {
      throw new ForbiddenException('User is not linked to a guardian');
    }
    return this.studentsService.findByGuardian(
      user.guardianId,
      paginationQuery,
      req.url
    );
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
  })
  @ResponseMessage('Student profile retrieved successfully')
  async getMyProfile(@CurrentUser() user: User): Promise<Student> {
    if (!user.studentId) {
      throw new ForbiddenException('User is not linked to a student');
    }
    return this.studentsService.findOne(user.studentId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.INSTRUCTOR,
    UserRole.STUDENT,
    UserRole.GUARDIAN
  )
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Student retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Access denied to this resource',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ResponseMessage('Student retrieved successfully')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<Student> {
    // Admin and Instructor can see any student
    if (user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR) {
      return this.studentsService.findOne(id);
    }

    // Student can only see themselves
    if (user.role === UserRole.STUDENT) {
      if (user.studentId !== id) {
        throw new ForbiddenException('You can only access your own profile');
      }
      return this.studentsService.findOne(id);
    }

    // Guardian can see their children
    if (user.role === UserRole.GUARDIAN && user.guardianId) {
      const hasAccess = await this.studentsService.guardianHasAccessToStudent(
        user.guardianId,
        id
      );

      if (!hasAccess) {
        throw new ForbiddenException(
          "You can only access your children's data"
        );
      }

      return this.studentsService.findOne(id);
    }

    throw new ForbiddenException('Access denied');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update student (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ResponseMessage('Student updated successfully')
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto
  ): Promise<Student> {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete student (Admin only)' })
  @ApiResponse({ status: 204, description: 'Student deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ResponseMessage('Student deleted successfully')
  async remove(@Param('id') id: string): Promise<void> {
    return this.studentsService.remove(id);
  }
}
