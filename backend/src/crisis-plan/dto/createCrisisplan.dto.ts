import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCrisisPlanDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  triggerCondition: string; 

  @IsString()
  @IsNotEmpty()
  action: string; 
}