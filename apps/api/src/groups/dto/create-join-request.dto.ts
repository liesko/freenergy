import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJoinRequestDto {
  @IsString()
  @IsNotEmpty()
  meteringPointId: string;
}
