import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, Repository } from 'typeorm';
import { Machine } from './machine.entity';
import { CreateMachineDto } from './dto/createMachine.dto';
import { UpdateMachineDto } from './dto/updateMachine.dto';
import { Task } from 'src/task/task.entity';
import { TaskAssignment } from 'src/task/task-assignment.entity';

@Injectable()
export class MachineService {
  constructor(
    @InjectRepository(Machine)
    private machineRepository: Repository<Machine>,

      @InjectRepository(TaskAssignment)
        private taskAssignmentRepository: Repository<TaskAssignment>,
     @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  create(dto: CreateMachineDto): Promise<Machine> {
    const machine = this.machineRepository.create(dto);
    return this.machineRepository.save(machine);
  }


  findAll(): Promise<Machine[]> {
  return this.machineRepository.find({ relations: ['currentTask'] });
}

  async findOne(id: number): Promise<Machine> {
    const machine = await this.machineRepository.findOne({ where: { id }, relations: ['currentTask'] });
    if (!machine) throw new NotFoundException(`Machine ${id} not found`);
    return machine;
  }

  async update(id: number, dto: UpdateMachineDto): Promise<Machine> {
    await this.machineRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.machineRepository.delete(id);
  }


async getAvailableMachinesForDay(date: Date, manager: EntityManager): Promise<Machine[]> {

  const allMachines = await manager.find(Machine, { where: { availability: true } });
  const availableMachines: Machine[] = [];


  const targetDate = date.toISOString().split('T')[0];

  for (const machine of allMachines) {
   
    const assignments = await manager.find(TaskAssignment, {
      where: {
        machine: { id: machine.id },
        startDate: date,
      },
    });


    if (assignments.length === 0) {
      availableMachines.push(machine);
    }
  }

  return availableMachines;
}

 async getAllMachines(): Promise<Machine[]> {
    return this.machineRepository.find();
  }
}
