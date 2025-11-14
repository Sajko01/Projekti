import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { CrisisPlanService } from './crisis-plan.service';
import { CreateCrisisPlanDto } from './dto/createCrisisplan.dto';
import { UpdateCrisisPlanDto } from './dto/updateCrisisplan.dto';

@Controller('crisis-plans')
export class CrisisPlanController {
  constructor(private readonly crisisPlanService: CrisisPlanService) {}

  @Get()
  findAll() {
    return this.crisisPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.crisisPlanService.findOne(id);
  }

  @Post()
  create(@Body() createCrisisPlanDto: CreateCrisisPlanDto) {
    return this.crisisPlanService.create(createCrisisPlanDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateCrisisPlanDto: UpdateCrisisPlanDto) {
    return this.crisisPlanService.update(id, updateCrisisPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.crisisPlanService.remove(id);
  }
}
