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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@gym-management/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@gym-management/domain';

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
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'List all students (Admin/Instructor only)' })
  @ApiResponse({ status: 200, description: 'Students list' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get('my-children')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GUARDIAN)
  @ApiOperation({ summary: 'Get all children for current guardian' })
  @ApiResponse({ status: 200, description: 'List of children under guardianship' })
  async findMyChildren(@CurrentUser() user: User) {
    if (!user.guardianId) {
      throw new ForbiddenException('User is not linked to a guardian');
    }
    return this.studentsService.findByGuardian(user.guardianId);
  }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiResponse({ status: 200, description: 'Student profile' })
  async getMyProfile(@CurrentUser() user: User) {
    if (!user.studentId) {
      throw new ForbiddenException('User is not linked to a student');
    }
    return this.studentsService.findOne(user.studentId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.GUARDIAN)
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Student found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your resource' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
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
        throw new ForbiddenException('You can only access your children\'s data');
      }
      
      return this.studentsService.findOne(id);
    }

    throw new ForbiddenException('Access denied');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update student (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete student (Admin only)' })
  @ApiResponse({ status: 204, description: 'Student deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
