import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Machine } from './machine.entity';
import { MachineService } from './machine.service';
import { Task } from '../task/task.entity'; 
import { TaskModule } from '../task/task.module'; 
import { MachineController } from './machine.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Machine, Task]), 
    TaskModule, 
  ],
  providers: [MachineService],
   controllers: [MachineController],
  exports: [MachineService],
})
export class MachineModule {}
