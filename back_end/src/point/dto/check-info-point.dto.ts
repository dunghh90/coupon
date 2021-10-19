import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CheckInfoPoint {
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    customerId: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    storeId: string;

}