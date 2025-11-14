import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { MethodService } from './method.service';
import { CreateMethodDto } from './dto/createMethod.dto';
import { UpdateMethodDto } from './dto/updateMethod.dto';

@Controller('methods')
export class MethodController {
  constructor(private readonly methodService: MethodService) {}

  @Get()
  findAll() {
    return this.methodService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.methodService.findOne(id);
  }

  @Post()
  create(@Body() createMethodDto: CreateMethodDto) {
    return this.methodService.create(createMethodDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMethodDto: UpdateMethodDto) {
    return this.methodService.update(id, updateMethodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.methodService.remove(id);
  }
}
