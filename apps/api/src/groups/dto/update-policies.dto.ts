import { IsBoolean, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { AcceptedMeteringPointType } from '@prisma/client';

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerKwh?: number;
}
