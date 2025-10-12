import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '@gym-management/domain';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create(createPlanDto);
    return this.planRepository.save(plan);
  }

  async findAll(): Promise<Plan[]> {
    return this.planRepository.find();
  }

  async findActive(): Promise<Plan[]> {
    return this.planRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);
    Object.assign(plan, updatePlanDto);
    return this.planRepository.save(plan);
  }

  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);
    await this.planRepository.remove(plan);
  }
}

