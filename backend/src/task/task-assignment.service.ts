

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TaskAssignment } from './task-assignment.entity';
import { Task } from './task.entity';
import { Machine } from 'src/machine/machine.entity';
import { Worker as WorkerEntity } from 'src/worker/worker.entity';

export class TaskAssignmentDto {
  taskId: number;
  workerId?: number;
  machineId?: number;
  startDate: Date;
  endDate: Date;
}



@Injectable()
export class TaskAssignmentService {
  private readonly logger = new Logger(TaskAssignmentService.name);

  constructor(
    @InjectRepository(TaskAssignment)
    private readonly taskAssignmentRepository: Repository<TaskAssignment>,
  ) {}



    async getAll(): Promise<TaskAssignmentDto[]> {
    const assignments = await this.taskAssignmentRepository.find({
      relations: ['task', 'worker', 'machine'],
    });


    return assignments.map(a => ({
      id: a.id,
      taskId: a.task.id,
      workerId: a.worker?.id,
      machineId: a.machine?.id,
      startDate: a.startDate,
      endDate: a.endDate,
    }));
  }






  async createWorkerAssignment(
    task: Task,
    worker: WorkerEntity,
    startDate: Date,
    endDate: Date,
  ): Promise<TaskAssignment> {
    this.logger.log(
      `🛠️ Creating worker assignment: Task ${task.id}, Worker ${worker.id}, Period ${startDate.toISOString()} - ${endDate.toISOString()}`
    );

    const existing = await this.findOverlappingAssignment(task.id, worker.id, startDate, endDate);
    if (existing) {
      this.logger.warn(
        `⚠️ Assignment već postoji za Worker ${worker.id} i Task ${task.id} u tom periodu.`
      );
      return existing;
    }

    const assignment = this.taskAssignmentRepository.create({
      task,
      worker,
      startDate,
      endDate,
    });
    return await this.taskAssignmentRepository.save(assignment);
  }


  async createMachineAssignment(
    task: Task,
    machine: Machine,
    startDate: Date,
    endDate: Date,
  ): Promise<TaskAssignment> {
    this.logger.log(
      `⚙️ Creating machine assignment: Task ${task.id}, Machine ${machine.id}, Period ${startDate.toISOString()} - ${endDate.toISOString()}`
    );

    const existing = await this.findOverlappingAssignment(task.id, machine.id, startDate, endDate, 'machine');
    if (existing) {
      this.logger.warn(
        `⚠️ Assignment već postoji za Machine ${machine.id} i Task ${task.id} u tom periodu.`
      );
      return existing;
    }

    const assignment = this.taskAssignmentRepository.create({
      task,
      machine,
      startDate,
      endDate,
    });
    return await this.taskAssignmentRepository.save(assignment);
  }


  async findOverlappingAssignment(
    taskId: number,
    resourceId: number,
    startDate: Date,
    endDate: Date,
    type: 'worker' | 'machine' = 'worker',
  ): Promise<TaskAssignment | null> {
    return await this.taskAssignmentRepository.findOne({
      where: {
        task: { id: taskId },
        ...(type === 'worker'
          ? { worker: { id: resourceId } }
          : { machine: { id: resourceId } }),
        startDate: LessThanOrEqual(endDate),
        endDate: MoreThanOrEqual(startDate),
      },
      relations: ['task', 'worker', 'machine'],
    });
  }


  async deleteAssignment(id: number): Promise<void> {
    this.logger.warn(`🗑️ Deleting assignment with ID: ${id}`);
    await this.taskAssignmentRepository.delete(id);
  }

  async deleteAssignmentsForTask(taskId: number): Promise<void> {
    this.logger.warn(`🗑️ Deleting all assignments for Task ${taskId}`);
    await this.taskAssignmentRepository.delete({ task: { id: taskId } });
  }

    async remove(id: number): Promise<void> {
    await this.taskAssignmentRepository.delete(id);
  }
}
