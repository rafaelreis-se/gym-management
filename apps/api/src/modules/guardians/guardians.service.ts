import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guardian, StudentGuardian } from '@gym-management/domain';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { LinkGuardianToStudentDto } from './dto/link-guardian-to-student.dto';

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

  async findAll(): Promise<Guardian[]> {
    return this.guardianRepository.find({
      relations: ['studentGuardians', 'studentGuardians.student'],
    });
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

  async findByStudent(studentId: string): Promise<StudentGuardian[]> {
    return this.studentGuardianRepository.find({
      where: { studentId },
      relations: ['guardian'],
    });
  }

  async findFinanciallyResponsible(studentId: string): Promise<Guardian[]> {
    const relationships = await this.studentGuardianRepository.find({
      where: { studentId, isFinanciallyResponsible: true },
      relations: ['guardian'],
    });

    return relationships.map((rel) => rel.guardian);
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

