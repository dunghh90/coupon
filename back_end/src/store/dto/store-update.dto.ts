import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { StoreStatus } from "../enum/status.store.enum";

export class StoreUpdateDto {
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
    @IsString()
    readonly phone: string;
    
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    readonly timeActive: string;

}