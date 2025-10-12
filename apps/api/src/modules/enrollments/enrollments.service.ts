import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '@gym-management/domain';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      relations: ['student', 'plan', 'payments'],
    });
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['student', 'plan', 'payments'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async findByStudent(studentId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { studentId },
      relations: ['plan', 'payments'],
    });
  }

  async update(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(id);
    Object.assign(enrollment, updateEnrollmentDto);
    return this.enrollmentRepository.save(enrollment);
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }
}

