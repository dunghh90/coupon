import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class StoreCreateDto {
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @ApiProperty()
    @AutoMap()
    readonly description: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    readonly address: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    readonly phone: string;
    
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    readonly timeActive: string;
   
}