import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guardian, StudentGuardian } from '@gym-management/domain';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { LinkGuardianToStudentDto } from './dto/link-guardian-to-student.dto';
import {
  PaginationQueryDto,
  PaginatedResponse,
  PaginationUtils,
} from '../../common/pagination/pagination.utils';

@Injectable()
export class GuardiansService {
  constructor(
    @InjectRepository(Guardian)
    private readonly guardianRepository: Repository<Guardian>,
    @InjectRepository(StudentGuardian)
    private readonly studentGuardianRepository: Repository<StudentGuardian>
  ) {}

  async create(createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    const guardian = this.guardianRepository.create(createGuardianDto);
    return this.guardianRepository.save(guardian);
  }

  async findAll(
    paginationQuery: PaginationQueryDto
  ): Promise<PaginatedResponse<Guardian>> {
    const queryBuilder = this.guardianRepository
      .createQueryBuilder('guardian')
      .leftJoinAndSelect('guardian.studentGuardians', 'studentGuardian')
      .leftJoinAndSelect('studentGuardian.student', 'student');

    // Apply search filter if provided
    if (paginationQuery.search) {
      const searchTerm = `%${paginationQuery.search}%`;
      queryBuilder.where(
        'guardian.fullName ILIKE :search OR guardian.cpf ILIKE :search OR guardian.email ILIKE :search',
        { search: searchTerm }
      );
    }

    // Apply sorting
    const sortField = paginationQuery.sortBy || 'fullName';
    const sortOrder = paginationQuery.sortOrder || 'ASC';

    // Map sortBy fields to correct database column names
    const fieldMap: Record<string, string> = {
      name: 'fullName',
      fullName: 'fullName',
      email: 'email',
      cpf: 'cpf',
      phone: 'phone',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const mappedSortField = fieldMap[sortField] || 'fullName';
    queryBuilder.orderBy(`guardian.${mappedSortField}`, sortOrder);

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

  async findOne(id: string): Promise<Guardian> {
    const guardian = await this.guardianRepository.findOne({
      where: { id },
      relations: ['studentGuardians', 'studentGuardians.student'],
    });

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${id} not found`);
    }

    return guardian;
  }

  async findByCpf(cpf: string): Promise<Guardian | null> {
    return this.guardianRepository.findOne({
      where: { cpf },
      relations: ['studentGuardians', 'studentGuardians.student'],
    });
  }

  async findOrCreate(createGuardianDto: CreateGuardianDto): Promise<Guardian> {
    // Check if guardian already exists by CPF
    const existing = await this.findByCpf(createGuardianDto.cpf);

    if (existing) {
      return existing;
    }

    // Create new guardian
    return this.create(createGuardianDto);
  }

  async findByStudent(studentId: string): Promise<Guardian[]> {
    const relationships = await this.studentGuardianRepository.find({
      where: { studentId },
      relations: ['guardian'],
    });

    return relationships.map((rel) => rel.guardian);
  }

  async findFinanciallyResponsible(
    studentId: string
  ): Promise<Guardian | null> {
    const relationship = await this.studentGuardianRepository.findOne({
      where: { studentId, isFinanciallyResponsible: true },
      relations: ['guardian'],
    });

    return relationship ? relationship.guardian : null;
  }

  async linkToStudent(
    linkDto: LinkGuardianToStudentDto
  ): Promise<StudentGuardian> {
    const studentGuardian = this.studentGuardianRepository.create(linkDto);
    return this.studentGuardianRepository.save(studentGuardian);
  }

  async unlinkFromStudent(relationshipId: string): Promise<void> {
    const relationship = await this.studentGuardianRepository.findOne({
      where: { id: relationshipId },
    });

    if (!relationship) {
      throw new NotFoundException(
        `Relationship with ID ${relationshipId} not found`
      );
    }

    await this.studentGuardianRepository.remove(relationship);
  }

  async update(
    id: string,
    updateGuardianDto: UpdateGuardianDto
  ): Promise<Guardian> {
    const guardian = await this.findOne(id);
    Object.assign(guardian, updateGuardianDto);
    return this.guardianRepository.save(guardian);
  }

  async remove(id: string): Promise<void> {
    const guardian = await this.findOne(id);
    await this.guardianRepository.remove(guardian);
  }
}
