import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Method } from './method.entity';
import { CreateMethodDto } from './dto/createMethod.dto';
import { UpdateMethodDto } from './dto/updateMethod.dto';

@Injectable()
export class MethodService {
  constructor(
    @InjectRepository(Method)
    private methodRepository: Repository<Method>,
  ) {}

  create(dto: CreateMethodDto): Promise<Method> {
    const method = this.methodRepository.create(dto);
    return this.methodRepository.save(method);
  }

  findAll(): Promise<Method[]> {
    return this.methodRepository.find();
  }

  async findOne(id: number): Promise<Method> {
    const method = await this.methodRepository.findOne({ where: { id } });
    if (!method) throw new NotFoundException(`Method ${id} not found`);
    return method;
  }

  async update(id: number, dto: UpdateMethodDto): Promise<Method> {
    await this.methodRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.methodRepository.delete(id);
  }
}
