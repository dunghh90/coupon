import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  couponGlobalCode: string;
}
