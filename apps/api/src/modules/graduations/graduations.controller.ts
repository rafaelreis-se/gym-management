import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { GraduationsService } from './graduations.service';
import { CreateGraduationDto } from './dto/create-graduation.dto';
import { Graduation } from '@gym-management/domain';
import { ResponseMessage } from '../../common/interceptors/api-response.interceptor';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@gym-management/common';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../../common/pagination/pagination.utils';

@ApiTags('graduations')
@ApiBearerAuth()
@Controller('graduations')
export class GraduationsController {
  constructor(private readonly graduationsService: GraduationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new graduation' })
  @ApiResponse({ status: 201, description: 'Graduation successfully created' })
  @ResponseMessage('Graduation successfully created')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(
    @Body() createGraduationDto: CreateGraduationDto
  ): Promise<Graduation> {
    return this.graduationsService.create(createGraduationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all graduations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Graduations list successfully retrieved',
  })
  @ResponseMessage('Graduations list successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll(): Promise<Graduation[]> {
    return this.graduationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get graduation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Graduation successfully retrieved',
  })
  @ApiResponse({ status: 404, description: 'Graduation not found' })
  @ResponseMessage('Graduation successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findOne(@Param('id') id: string): Promise<Graduation> {
    return this.graduationsService.findOne(id);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get graduations by student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student graduations successfully retrieved',
  })
  @ResponseMessage('Student graduations successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findByStudent(@Param('studentId') studentId: string): Promise<Graduation[]> {
    return this.graduationsService.findByStudent(studentId);
  }

  @Get('student/:studentId/current')
  @ApiOperation({ summary: 'Get current graduation for student' })
  @ApiResponse({
    status: 200,
    description: 'Current graduation successfully retrieved',
  })
  @ApiResponse({ status: 404, description: 'Current graduation not found' })
  @ResponseMessage('Current graduation successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  getCurrentGraduation(
    @Param('studentId') studentId: string
  ): Promise<Graduation | null> {
    return this.graduationsService.getCurrentGraduation(studentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove graduation by ID' })
  @ApiResponse({ status: 204, description: 'Graduation successfully removed' })
  @ApiResponse({ status: 404, description: 'Graduation not found' })
  @ResponseMessage('Graduation successfully removed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.graduationsService.remove(id);
  }
}
