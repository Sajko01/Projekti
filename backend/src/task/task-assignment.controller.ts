import { Controller, Delete, Get, Param } from '@nestjs/common';
import { TaskAssignmentService } from './task-assignment.service';

@Controller('task-assignments')
export class TaskAssignmentController {
  constructor(private readonly service: TaskAssignmentService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }
   @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
