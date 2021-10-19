import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSendMailDto {
    
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    readonly toUser: string;

    @ApiProperty()
    @AutoMap()
    readonly subject: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    readonly content: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    readonly sendDate: string;
    
}
