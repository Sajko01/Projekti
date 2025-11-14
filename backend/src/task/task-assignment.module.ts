import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskAssignment } from './task-assignment.entity';
import { TaskAssignmentService } from './task-assignment.service';
import { TaskAssignmentController } from './task-assignment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskAssignment])],
  providers: [TaskAssignmentService],
  controllers: [TaskAssignmentController],
  exports: [TaskAssignmentService],
})
export class TaskAssignmentModule {}
