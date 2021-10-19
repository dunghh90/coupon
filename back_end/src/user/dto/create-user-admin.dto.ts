import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber } from 'class-validator';
import { Role } from 'src/auth/enum/role.enum';

export class CreateUserAdminDto {
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

  @ApiProperty()
  @AutoMap()
  readonly address: string;

  @ApiProperty()
  @AutoMap()
  @IsNotEmpty()
  readonly phone: number;

  @ApiProperty()
  @AutoMap()
  readonly roles: Role;

}
