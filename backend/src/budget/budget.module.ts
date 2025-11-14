import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './budget.entity';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Budget])],
  providers: [BudgetService],
   controllers: [BudgetController],
  exports: [BudgetService, TypeOrmModule], 
})
export class BudgetModule {}