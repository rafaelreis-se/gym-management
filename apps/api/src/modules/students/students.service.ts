import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Student } from '@gym-management/domain';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentWithGuardianDto } from './dto/create-student-with-guardian.dto';
import { GuardiansService } from '../guardians/guardians.service';
import { AgeCategory, GuardianRelationship } from '@gym-management/common';
import {
  PaginationQueryDto,
  PaginationUtils,
  PaginatedResponse,
} from '../../common/pagination/pagination.utils';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @Inject(forwardRef(() => GuardiansService))
    private readonly guardiansService: GuardiansService
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(student);
  }

  /**
   * Create student with optional guardian
   * - For adult students: no guardian needed
   * - For children: requires guardian
   * - Reuses existing guardian if CPF already exists
   */
  async createWithGuardian(
    dto: CreateStudentWithGuardianDto
  ): Promise<{ student: Student; guardianId?: string }> {
    // Create student first
    const student = await this.create(dto.student);

    // If guardian data provided and student is a child
    if (dto.guardian && dto.student.ageCategory === AgeCategory.CHILD) {
      // Find or create guardian (reuses if CPF exists)
      const guardian = await this.guardiansService.findOrCreate(dto.guardian);

      // Link guardian to student
      await this.guardiansService.linkToStudent({
        studentId: student.id,
        guardianId: guardian.id,
        relationship:
          dto.guardianRelationship?.relationship || GuardianRelationship.OTHER,
        isFinanciallyResponsible:
          dto.guardianRelationship?.isFinanciallyResponsible ?? true,
        isEmergencyContact:
          dto.guardianRelationship?.isEmergencyContact ?? true,
        canPickUp: dto.guardianRelationship?.canPickUp ?? true,
      });

      return { student, guardianId: guardian.id };
    }

    return { student };
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
    baseUrl?: string
  ): Promise<PaginatedResponse<Student>> {
    const { page, limit, search, sortBy, sortOrder } = paginationQuery;

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.enrollments', 'enrollments')
      .leftJoinAndSelect('student.graduations', 'graduations')
      .leftJoinAndSelect('student.studentGuardians', 'studentGuardians')
      .leftJoinAndSelect('studentGuardians.guardian', 'guardian');

    // Apply search filter if provided
    if (search) {
      queryBuilder.where(
        '(student.fullName ILIKE :search OR student.email ILIKE :search OR student.cpf ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder || 'DESC';

    // Map sortBy fields to correct database column names
    const fieldMap: Record<string, string> = {
      name: 'fullName',
      fullName: 'fullName',
      email: 'email',
      cpf: 'cpf',
      age: 'birthDate',
      birthDate: 'birthDate',
      belt: 'createdAt', // Default fallback for belt-related sorting
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const mappedSortField = fieldMap[sortField] || 'createdAt';
    queryBuilder.orderBy(`student.${mappedSortField}`, sortDirection);

    // Apply pagination
    const offset = PaginationUtils.getOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    // Execute query and count
    const [students, totalItems] = await queryBuilder.getManyAndCount();

    // Create paginated response
    return PaginationUtils.createResponse(
      students,
      totalItems,
      page,
      limit,
      baseUrl,
      { search, sortBy, sortOrder }
    );
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: [
        'enrollments',
        'graduations',
        'studentGuardians',
        'studentGuardians.guardian',
      ],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async findByGuardian(
    guardianId: string,
    paginationQuery?: PaginationQueryDto,
    baseUrl?: string
  ): Promise<PaginatedResponse<Student>> {
    const { page, limit, search, sortBy, sortOrder } = paginationQuery || {
      page: 1,
      limit: 10,
      sortOrder: 'DESC' as const,
    };

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.enrollments', 'enrollments')
      .leftJoinAndSelect('student.graduations', 'graduations')
      .leftJoinAndSelect('student.studentGuardians', 'studentGuardians')
      .leftJoinAndSelect('studentGuardians.guardian', 'guardian')
      .innerJoin('student.studentGuardians', 'sg')
      .where('sg.guardianId = :guardianId', { guardianId });

    // Apply search filter if provided
    if (search) {
      queryBuilder.andWhere(
        '(student.fullName ILIKE :search OR student.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder || 'DESC';
    queryBuilder.orderBy(`student.${sortField}`, sortDirection);

    // Apply pagination
    const offset = PaginationUtils.getOffset(page, limit);
    queryBuilder.skip(offset).take(limit);

    // Execute query and count
    const [students, totalItems] = await queryBuilder.getManyAndCount();

    // Create paginated response
    return PaginationUtils.createResponse(
      students,
      totalItems,
      page,
      limit,
      baseUrl,
      { search, sortBy, sortOrder }
    );
  }

  async findByUserId(userId: string): Promise<Student | null> {
    return this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('users', 'user', 'user.studentId = student.id')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto
  ): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async findByCpf(cpf: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { cpf } });
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { email } });
  }

  /**
   * Check if guardian has access to student
   */
  async guardianHasAccessToStudent(
    guardianId: string,
    studentId: string
  ): Promise<boolean> {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.studentGuardians', 'sg')
      .where('student.id = :studentId', { studentId })
      .andWhere('sg.guardianId = :guardianId', { guardianId })
      .getOne();

    return !!student;
  }
}
