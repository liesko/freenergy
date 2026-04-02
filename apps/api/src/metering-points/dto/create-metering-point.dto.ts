import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { MeteringPointType } from '@prisma/client';

export class CreateMeteringPointDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  eic: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(MeteringPointType)
  type: MeteringPointType;
}
