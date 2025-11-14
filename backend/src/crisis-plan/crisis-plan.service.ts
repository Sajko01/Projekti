import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { CrisisPlan } from './crisis-plan.entity';
import { CreateCrisisPlanDto } from './dto/createCrisisplan.dto';
import { UpdateCrisisPlanDto } from './dto/updateCrisisplan.dto';
import { MachineService } from 'src/machine/machine.service';
import { WorkerService } from 'src/worker/worker.service';
import { BudgetService } from 'src/budget/budget.service';
import { Task } from 'src/task/task.entity';

@Injectable()
export class CrisisPlanService {

     private readonly logger = new Logger(CrisisPlanService.name);
  constructor(
    @InjectRepository(CrisisPlan)
    private readonly crisisPlanRepository: Repository<CrisisPlan>,

     private readonly workerService: WorkerService,
    private readonly machineService: MachineService,
    private readonly budgetService: BudgetService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  create(dto: CreateCrisisPlanDto): Promise<CrisisPlan> {
    const plan = this.crisisPlanRepository.create(dto);
    return this.crisisPlanRepository.save(plan);
  }

  findAll(): Promise<CrisisPlan[]> {
    return this.crisisPlanRepository.find();
  }

  async findOne(id: number): Promise<CrisisPlan> {
    const plan = await this.crisisPlanRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`CrisisPlan ${id} not found`);
    return plan;
  }

  async update(id: number, dto: UpdateCrisisPlanDto): Promise<CrisisPlan> {
    await this.crisisPlanRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.crisisPlanRepository.delete(id);
  }

 


  
}
