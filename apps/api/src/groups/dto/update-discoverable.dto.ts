import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateDiscoverableDto {
  @IsBoolean()
  @IsNotEmpty()
  isDiscoverable: boolean;
}
