import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMpInvitationDto {
  @IsString()
  @IsNotEmpty()
  eic: string;
}
