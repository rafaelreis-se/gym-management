import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GraduationsService } from './graduations.service';
import { CreateGraduationDto } from './dto/create-graduation.dto';

@ApiTags('graduations')
@Controller('graduations')
export class GraduationsController {
  constructor(private readonly graduationsService: GraduationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGraduationDto: CreateGraduationDto) {
    return this.graduationsService.create(createGraduationDto);
  }

  @Get()
  findAll() {
    return this.graduationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.graduationsService.findOne(id);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.graduationsService.findByStudent(studentId);
  }

  @Get('student/:studentId/current')
  getCurrentGraduation(@Param('studentId') studentId: string) {
    return this.graduationsService.getCurrentGraduation(studentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.graduationsService.remove(id);
  }
}

