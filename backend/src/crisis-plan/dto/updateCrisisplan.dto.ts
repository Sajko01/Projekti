import { PartialType } from '@nestjs/mapped-types';
import { CreateCrisisPlanDto } from './createCrisisplan.dto';

export class UpdateCrisisPlanDto extends PartialType(CreateCrisisPlanDto) {}