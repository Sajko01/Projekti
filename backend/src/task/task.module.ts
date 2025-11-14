
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { WorkerService } from '../worker/worker.service';
import { MachineService } from '../machine/machine.service';
import { BudgetService } from '../budget/budget.service';
import { BudgetModule } from 'src/budget/budget.module';


import { Task } from './task.entity';

import { TaskAssignment } from './task-assignment.entity';


import { TaskAssignmentService } from './task-assignment.service';
import { Machine } from 'src/machine/machine.entity';
import { CrisisPlan } from 'src/crisis-plan/crisis-plan.entity';
import { Worker } from 'src/worker/worker.entity';
import { Material, TaskMaterial } from 'src/material/material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Worker,
      Machine,
      CrisisPlan,
      TaskAssignment, 
      Material,
      TaskMaterial,
    ]),
    BudgetModule,
  ],
  providers: [
    TaskService,
    WorkerService,
    MachineService,
    BudgetService,
    TaskAssignmentService, 
  ],
  controllers: [TaskController],
  exports: [TaskService, TypeOrmModule, TaskAssignmentService], 
})
export class TaskModule {}
