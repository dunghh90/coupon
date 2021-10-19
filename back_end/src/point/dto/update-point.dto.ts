import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePointDto {
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    userName: string;

    @ApiProperty()
    @AutoMap()
    @IsOptional()
    @IsEmail()
    email: string;

    @ApiProperty()
    @AutoMap()
    @IsOptional()
    @IsNumber()
    phone: number;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    storeId: string;

    @ApiProperty()
    @AutoMap()
    @IsNumber()
    point: number;
}