import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  readonly phone: string;

}
