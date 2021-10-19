import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class StoreAddManagerDto {
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    readonly email: string;
}