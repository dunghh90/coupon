import { AutoMap } from "@automapper/classes";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ViewPointDto {
    @ApiPropertyOptional()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    storeId: string;
}
