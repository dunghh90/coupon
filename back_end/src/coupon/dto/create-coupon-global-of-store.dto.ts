import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCouponGlobalOfStoreDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  couponGlobalId: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  storeId: string;
}
