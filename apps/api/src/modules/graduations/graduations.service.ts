import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Graduation } from '@gym-management/domain';
import { CreateGraduationDto } from './dto/create-graduation.dto';

@Injectable()
export class GraduationsService {
  constructor(
    @InjectRepository(Graduation)
    private readonly graduationRepository: Repository<Graduation>
  ) {}

  async create(createGraduationDto: CreateGraduationDto): Promise<Graduation> {
    const graduation = this.graduationRepository.create(createGraduationDto);
    return this.graduationRepository.save(graduation);
  }

  async findAll(): Promise<Graduation[]> {
    return this.graduationRepository.find({
      relations: ['student'],
      order: { graduationDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Graduation> {
    const graduation = await this.graduationRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!graduation) {
      throw new NotFoundException(`Graduation with ID ${id} not found`);
    }

    return graduation;
  }

  async findByStudent(studentId: string): Promise<Graduation[]> {
    return this.graduationRepository.find({
      where: { studentId },
      order: { graduationDate: 'DESC' },
    });
  }

  async getCurrentGraduation(studentId: string): Promise<Graduation | null> {
    return this.graduationRepository.findOne({
      where: { studentId },
      order: { graduationDate: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const graduation = await this.findOne(id);
    await this.graduationRepository.remove(graduation);
  }
}

