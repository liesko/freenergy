import { IsString, IsNotEmpty } from 'class-validator';

export class AssignMeteringPointDto {
  @IsString()
  @IsNotEmpty()
  meteringPointId: string;
}
