import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/createTask.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import {
  Query,
  ParseIntPipe,
} from '@nestjs/common';


@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.taskService.findOne(id);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.taskService.remove(id);
  }

@Get(':id')
async getTask(@Param('id', ParseIntPipe) id: number) {
  return this.taskService.findOne(id);
}

@Get('stats/stats')
  async getDashboardStats() {
    return await this.taskService.getStats();
  }


  @Post('check-crisis-all')
  async checkAndApplyCrisisForAllTasks(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.taskService.checkAndApplyCrisisForAllTasks();
  }


  @Post('schedule')
  async scheduleTasks() {
    return this.taskService.scheduleTasks();
  }


@Get('analysis/rccp')
async roughCutCapacityPlanning(
  @Query('start') start: string,
  @Query('end') end: string,
  @Query('overTime') overTime: string,
  @Query('weekend') weekend: string,
) {
  console.log('📥 RCCP endpoint called with', { start, end, overTime, weekend });

  return this.taskService.roughCutCapacityPlanning(
    new Date(start),
    new Date(end),
    overTime === 'true',   
    weekend === 'true'     
  );
}

  @Post('adaptive-schedule')
  @HttpCode(HttpStatus.OK)
  async adaptiveScheduleAll(): Promise<{ message: string }> {
    try {
      await this.taskService.adaptiveScheduleAllTasks();
      return { message: 'Adaptive scheduling executed successfully.' };
    } catch (error) {
      console.error('❌ Error in adaptive scheduling controller', error);
      return { message: 'Error executing adaptive scheduling.' };
    }
  }


 @Get('report/production')
async generateReport(
  @Query('start') start: string,
  @Query('end') end: string,
) {
  return this.taskService.generateProductionReport(
    new Date(start),
    new Date(end),
  );
}

 @Post('daily-update')
  @HttpCode(HttpStatus.OK)
  async updateDailyBudget() {
    const report = await this.taskService.setBudget();
    return {
      message: '✅ Dnevni budžet je uspešno ažuriran!',
      report,
    };
  }

    @Post('update-production')
  async updateProductionManually() {
    console.log('📤 Ručno pokretanje updateDailyProducedProducts()...');
    const result = await this.taskService.updateDailyProducedProducts();
    return {
      message: '✅ Dnevna proizvodnja uspešno ažurirana ručno!',
      result,
    };
  }


  @Get('recalculate/costs')
async recalculateCosts() {
  await this.taskService.calculateTotalCostForAllTasks();
  return { message: '✅ Troškovi svih zadataka recalculisani i snimljeni.' };
}


}
