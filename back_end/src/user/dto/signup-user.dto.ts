import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber } from 'class-validator';

export class SignUpUserDto {
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
  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  readonly password: number;

  //DongTC update
  @ApiProperty()
  @AutoMap()
  readonly address: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  readonly phone: number;

  //DongTC end update

}
