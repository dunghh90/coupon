import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class StoreDeleteManagerDto {
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    readonly userId: string;
}