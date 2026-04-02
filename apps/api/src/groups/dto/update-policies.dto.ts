import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { AcceptedMeteringPointType } from 'database';

export class UpdateGroupPoliciesDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptsJoinRequests?: boolean;

  @IsOptional()
  @IsBoolean()
  acceptsInvitations?: boolean;

  @IsOptional()
  @IsEnum(AcceptedMeteringPointType)
  acceptedMeteringPointTypes?: AcceptedMeteringPointType;
}
