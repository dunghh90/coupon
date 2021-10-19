import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateCouponGlobalDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @AutoMap()
  @IsString()
  description: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  firstAmount: number;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  expiration_datetime: Date;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  status: string;
}
