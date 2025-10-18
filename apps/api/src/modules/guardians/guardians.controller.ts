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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { LinkGuardianToStudentDto } from './dto/link-guardian-to-student.dto';
import { Guardian, StudentGuardian } from '@gym-management/domain';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../../common/pagination/pagination.utils';
import { ResponseMessage } from '../../common/interceptors/api-response.interceptor';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@gym-management/common';

@ApiTags('guardians')
@ApiBearerAuth()
@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new guardian' })
  @ApiResponse({ status: 201, description: 'Guardian successfully created' })
  @ResponseMessage('Guardian successfully created')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    return this.guardiansService.create(createGuardianDto);
  }

  @Post('link-to-student')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Link guardian to student' })
  @ApiResponse({
    status: 201,
    description: 'Guardian successfully linked to student',
  })
  @ResponseMessage('Guardian successfully linked to student')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  linkToStudent(
    @Body() linkDto: LinkGuardianToStudentDto
  ): Promise<StudentGuardian> {
    return this.guardiansService.linkToStudent(linkDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all guardians with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Guardians list successfully retrieved',
  })
  @ResponseMessage('Guardians list successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponse<Guardian>> {
    return this.guardiansService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get guardian by ID' })
  @ApiResponse({ status: 200, description: 'Guardian successfully retrieved' })
  @ApiResponse({ status: 404, description: 'Guardian not found' })
  @ResponseMessage('Guardian successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string): Promise<Guardian> {
    return this.guardiansService.findOne(id);
  }

  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Get guardian by CPF' })
  @ApiResponse({ status: 200, description: 'Guardian successfully retrieved' })
  @ApiResponse({ status: 404, description: 'Guardian not found' })
  @ResponseMessage('Guardian successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findByCpf(@Param('cpf') cpf: string): Promise<Guardian | null> {
    return this.guardiansService.findByCpf(cpf);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get guardians by student ID' })
  @ApiResponse({
    status: 200,
    description: 'Student guardians successfully retrieved',
  })
  @ResponseMessage('Student guardians successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findByStudent(@Param('studentId') studentId: string): Promise<Guardian[]> {
    return this.guardiansService.findByStudent(studentId);
  }

  @Get('student/:studentId/financially-responsible')
  @ApiOperation({ summary: 'Get financially responsible guardian for student' })
  @ApiResponse({
    status: 200,
    description: 'Financially responsible guardian successfully retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Financially responsible guardian not found',
  })
  @ResponseMessage('Financially responsible guardian successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findFinanciallyResponsible(
    @Param('studentId') studentId: string
  ): Promise<Guardian | null> {
    return this.guardiansService.findFinanciallyResponsible(studentId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update guardian by ID' })
  @ApiResponse({ status: 200, description: 'Guardian successfully updated' })
  @ApiResponse({ status: 404, description: 'Guardian not found' })
  @ResponseMessage('Guardian successfully updated')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateGuardianDto: UpdateGuardianDto
  ): Promise<Guardian> {
    return this.guardiansService.update(id, updateGuardianDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove guardian by ID' })
  @ApiResponse({ status: 204, description: 'Guardian successfully removed' })
  @ApiResponse({ status: 404, description: 'Guardian not found' })
  @ResponseMessage('Guardian successfully removed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.guardiansService.remove(id);
  }

  @Delete('relationship/:relationshipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unlink guardian from student' })
  @ApiResponse({
    status: 204,
    description: 'Guardian successfully unlinked from student',
  })
  @ApiResponse({ status: 404, description: 'Relationship not found' })
  @ResponseMessage('Guardian successfully unlinked from student')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  unlinkFromStudent(
    @Param('relationshipId') relationshipId: string
  ): Promise<void> {
    return this.guardiansService.unlinkFromStudent(relationshipId);
  }
}
