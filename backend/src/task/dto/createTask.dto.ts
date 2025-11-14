import { IsString, IsNotEmpty, IsNumber, IsDate, Min, Max, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

    @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsNumber()
  @Min(1)
  @Max(5)
  priority: number;

  @IsNumber()
  @Min(1)
  requiredWorkers: number;

  @IsNumber()
  @Min(0)
  requiredMachines: number;

  @IsNumber()
  @Min(0)
  requiredBudget: number;

  @IsNumber()
  methodId: number; 

      @IsOptional()
  materials?: { name: string; quantity: number }[];

}
