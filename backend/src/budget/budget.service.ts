import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';
import { CreateBudgetDto } from './dto/createBudget.dto';
import { UpdateBudgetDto } from './dto/updateBudget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  create(dto: CreateBudgetDto): Promise<Budget> {
    const budget = this.budgetRepository.create(dto);
    return this.budgetRepository.save(budget);
  }

  findAll(): Promise<Budget[]> {
    return this.budgetRepository.find();
  }

  async findOne(id: number): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({ where: { id } });
    if (!budget) throw new NotFoundException(`Budget ${id} not found`);
    return budget;
  }

  async update(id: number, dto: UpdateBudgetDto): Promise<Budget> {
    await this.budgetRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.budgetRepository.delete(id);
  }
async checkBudget(requiredBudget: number): Promise<boolean> {

  const budget = await this.budgetRepository.findOne({ where: { id: 1 } });

  console.log('💰 Budget from DB:', budget);

  if (!budget) {
    console.log('❌ Budget not found!');
    return false;
  }

  const availableAmount = budget.amountAllocated - budget.amountUsed;
  console.log('📊 Available budget:', availableAmount, '| Required budget:', requiredBudget);

  const result = availableAmount >= requiredBudget;

  if (!result) {
    console.log('❌ Nema dovoljno budžeta!');
  } else {
    console.log('✅ Budžet je dovoljan!');
  }

  return result;
}


async returnBudget(): Promise<any> {

  const budget = await this.budgetRepository.findOne({ where: { id: 1 } });

  console.log('💰 Budget from DB:', budget);

  if (!budget) {
    console.log('❌ Budget not found!');
    return false;
  }

  const availableAmount = budget.amountAllocated - budget.amountUsed;
  console.log('📊 Available budget:', availableAmount);


  return availableAmount;
}

}
