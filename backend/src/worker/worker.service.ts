import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, Repository } from 'typeorm';
import { Worker } from './worker.entity';
import { UpdateWorkerDto } from './dto/updateWorker.dto';
import { CreateWorkerDto } from './dto/createWorker.dto';
import { Task } from 'src/task/task.entity';
import { TaskAssignment } from 'src/task/task-assignment.entity';

@Injectable()
export class WorkerService {
  
  constructor(
    @InjectRepository(Worker)
    private workerRepository: Repository<Worker>,

    @InjectRepository(TaskAssignment)
    private taskAssignmentRepository: Repository<TaskAssignment>,

     @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  create(dto: CreateWorkerDto): Promise<Worker> {
    const worker = this.workerRepository.create(dto);
    return this.workerRepository.save(worker);
  }

  findAll(): Promise<Worker[]> {
  return this.workerRepository.find({ relations: ['currentTask'] });
}

async findOne(id: number): Promise<Worker> {
  const worker = await this.workerRepository.findOne({
    where: { id },
    relations: ['currentTask'] 
  });
  if (!worker) throw new NotFoundException(`Worker ${id} not found`);
  return worker;
}

  async update(id: number, dto: UpdateWorkerDto): Promise<Worker> {
    await this.workerRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.workerRepository.delete(id);
  }


async getAvailableWorkersForDay(day: Date, manager: EntityManager): Promise<Worker[]> {
  const allWorkers = await manager.find(Worker, { where: { availability: true } });
  const availableWorkers: Worker[] = [];

  for (const worker of allWorkers) {
    const assignments = await manager.find(TaskAssignment, {
      where: {
        worker: { id: worker.id },
        startDate: day,
      },
    });

    if (assignments.length === 0) {
      availableWorkers.push(worker);
    }
  }

  return availableWorkers;
}




 async getAllWorkers(): Promise<Worker[]> {
    return this.workerRepository.find();
  }

}
