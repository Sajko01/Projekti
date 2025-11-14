import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { CreateMaterialDto } from './dto/createMaterial.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  findAll(): Promise<Material[]> {
    return this.materialRepository.find();
  }

  findOne(id: number): Promise<Material | null> {
    return this.materialRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<Material >): Promise<Material | null> {
    await this.materialRepository.update(id, data);
    return this.materialRepository.findOneBy({ id });
  }

   create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    const material = this.materialRepository.create(createMaterialDto);
    return this.materialRepository.save(material);
  }
}
