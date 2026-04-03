import { IsNotEmpty, IsOptional, IsString, MinLength, IsNumber, Min } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePerKwh?: number;
}
