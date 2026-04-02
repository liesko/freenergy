import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveMeteringPointDto {
  @IsString()
  @IsNotEmpty()
  meteringPointId: string;
}
