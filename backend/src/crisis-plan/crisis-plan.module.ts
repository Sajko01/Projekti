import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrisisPlan } from './crisis-plan.entity';
import { CrisisPlanService } from './crisis-plan.service';
import { WorkerModule } from '../worker/worker.module';
import { MachineModule } from '../machine/machine.module';
import { BudgetModule } from '../budget/budget.module';
import { TaskModule } from '../task/task.module';
import { CrisisPlanController } from './crisis-plan.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CrisisPlan]), 
    forwardRef(() => WorkerModule), 
    MachineModule,                 
    BudgetModule,                   
    TaskModule,                      
  ],
  providers: [CrisisPlanService],
   controllers: [CrisisPlanController],
  exports: [CrisisPlanService],
})
export class CrisisPlanModule {}
