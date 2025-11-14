import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkerDto } from './createWorker.dto';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {}