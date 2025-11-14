import { Controller, Get, Patch, Param, Body, Post } from '@nestjs/common';
import { MaterialService } from './material.service';
import { Material } from './material.entity';
import { CreateMaterialDto } from './dto/createMaterial.dto';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  findAll(): Promise<Material[]> {
    return this.materialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Material | null> {
    return this.materialService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateData: Partial<Material>,
  ): Promise<Material | null> {
    return this.materialService.update(+id, updateData);
  }

   @Post()
  add(@Body() createMaterialDto: CreateMaterialDto): Promise<Material> {
    return this.materialService.create(createMaterialDto);
  }
}
