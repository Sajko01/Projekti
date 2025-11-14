import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Worker } from './worker.entity';
import { WorkerService } from './worker.service';
import { TaskModule } from '../task/task.module'; 
import { Task } from '../task/task.entity';
import { WorkerController } from './worker.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Worker, Task]), 

    TaskModule, 
  ],
  providers: [WorkerService],
   controllers: [WorkerController],
  exports: [WorkerService],
})
export class WorkerModule {}