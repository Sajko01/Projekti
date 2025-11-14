import { IsString, IsNotEmpty, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

    @IsString()
  @IsNotEmpty()
  type: string;


  @IsInt()
  @Min(1)
  @Max(10)
  skillLevel: number;

  @IsBoolean()
  availability: boolean;
}
