

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task/task.entity';
import { Worker } from './worker/worker.entity';
import { Machine } from './machine/machine.entity';
import { Budget } from './budget/budget.entity';
import { Method } from './method/method.entity';
import { CrisisPlan } from './crisis-plan/crisis-plan.entity';
import { Material, TaskMaterial } from './material/material.entity';
import { BudgetModule } from './budget/budget.module';
import { TaskModule } from './task/task.module';
import { WorkerModule } from './worker/worker.module';
import { MachineModule } from './machine/machine.module';
import { MethodModule } from './method/method.module';
import { CrisisPlanModule } from './crisis-plan/crisis-plan.module';
import { TaskAssignment } from './task/task-assignment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { MaterialModule } from './material/material.module';
import { TaskAssignmentModule } from './task/task-assignment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',  
      password: 'password',
      database: 'production_plan',
      entities: [Task, Worker, Machine, Budget, Method, CrisisPlan,Material,TaskAssignment,TaskMaterial],
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([Task, Worker, Machine, Budget, Method, CrisisPlan,TaskAssignment,Material,TaskMaterial]),
     ScheduleModule.forRoot(),
    
     BudgetModule,
    TaskModule,
    WorkerModule,
    MachineModule,
    MethodModule,
    CrisisPlanModule,
    MaterialModule,
    TaskAssignmentModule,
  ],
})
export class AppModule {}