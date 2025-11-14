import { IsString, IsNotEmpty, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

    @IsString()
  @IsNotEmpty()
  type: string;

  @IsInt()
  @Min(1)
  capacity: number; 

  @IsBoolean()
  availability: boolean;
}