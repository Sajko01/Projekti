import { PartialType } from '@nestjs/mapped-types';
import { CreateMachineDto } from './createMachine.dto';

export class UpdateMachineDto extends PartialType(CreateMachineDto) {}