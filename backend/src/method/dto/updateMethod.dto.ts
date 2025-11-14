import { PartialType } from '@nestjs/mapped-types';
import { CreateMethodDto } from './createMethod.dto';

export class UpdateMethodDto extends PartialType(CreateMethodDto) {}
