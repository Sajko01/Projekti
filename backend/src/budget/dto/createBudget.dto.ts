import { IsNumber, Min, IsString, IsNotEmpty } from 'class-validator';

export class CreateBudgetDto {
  @IsNumber()
  @Min(0)
  amountAllocated: number;

  @IsNumber()
  @Min(0)
  amountUsed: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}