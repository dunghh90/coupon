import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptUseCouponDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  couponId: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  storeManageId: string;
}
