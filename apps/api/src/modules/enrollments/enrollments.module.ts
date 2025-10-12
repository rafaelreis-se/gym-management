import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment, Student } from '@gym-management/domain';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { StudentsService } from '../students/students.service';

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, Student])],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, StudentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}

