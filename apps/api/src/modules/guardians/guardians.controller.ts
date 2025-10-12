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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { LinkGuardianToStudentDto } from './dto/link-guardian-to-student.dto';

@ApiTags('guardians')
@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGuardianDto: CreateGuardianDto) {
    return this.guardiansService.create(createGuardianDto);
  }

  @Post('link-to-student')
  @HttpCode(HttpStatus.CREATED)
  linkToStudent(@Body() linkDto: LinkGuardianToStudentDto) {
    return this.guardiansService.linkToStudent(linkDto);
  }

  @Get()
  findAll() {
    return this.guardiansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guardiansService.findOne(id);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.guardiansService.findByStudent(studentId);
  }

  @Get('student/:studentId/financially-responsible')
  findFinanciallyResponsible(@Param('studentId') studentId: string) {
    return this.guardiansService.findFinanciallyResponsible(studentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuardianDto: UpdateGuardianDto) {
    return this.guardiansService.update(id, updateGuardianDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.guardiansService.remove(id);
  }

  @Delete('relationship/:relationshipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unlinkFromStudent(@Param('relationshipId') relationshipId: string) {
    return this.guardiansService.unlinkFromStudent(relationshipId);
  }
}

