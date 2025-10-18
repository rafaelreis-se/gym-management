import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '@gym-management/domain';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
  PaginationUtils,
} from '../../common/pagination/pagination.utils';

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

  async findAll(
    paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponse<Enrollment>> {
    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.plan', 'plan')
      .leftJoinAndSelect('enrollment.payments', 'payments');

    // Apply search filter if provided
    if (paginationQuery.search) {
      const searchTerm = `%${paginationQuery.search}%`;
      queryBuilder.where(
        'student.name ILIKE :search OR plan.name ILIKE :search OR enrollment.status ILIKE :search',
        { search: searchTerm }
      );
    }

    // Apply sorting
    const sortField = paginationQuery.sortBy || 'enrollmentDate';
    const sortOrder = paginationQuery.sortOrder || 'DESC';
    queryBuilder.orderBy(`enrollment.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (paginationQuery.page - 1) * paginationQuery.limit;
    queryBuilder.skip(skip).take(paginationQuery.limit);

    // Execute query and get total count
    const [items, total] = await queryBuilder.getManyAndCount();

    // Return paginated response
    return PaginationUtils.createResponse(
      items,
      total,
      paginationQuery.page,
      paginationQuery.limit
    );
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
