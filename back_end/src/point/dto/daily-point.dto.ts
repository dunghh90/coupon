import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class DailyPointDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  qrId: string;

}
