import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { MachineService } from './machine.service';
import { CreateMachineDto } from './dto/createMachine.dto';
import { UpdateMachineDto } from './dto/updateMachine.dto';

@Controller('machines')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}

  @Get()
  findAll() {
    return this.machineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.machineService.findOne(id);
  }

  @Post()
  create(@Body() createMachineDto: CreateMachineDto) {
    return this.machineService.create(createMachineDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMachineDto: UpdateMachineDto) {
    return this.machineService.update(id, updateMachineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.machineService.remove(id);
  }
}
