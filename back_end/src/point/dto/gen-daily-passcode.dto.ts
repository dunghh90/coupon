import { Type } from 'class-transformer';
import { AutoMap } from "@automapper/classes";
import { ApiProperty, ApiPropertyOptional, } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class GenDailyPasscode {
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    storeId: string;

    @ApiPropertyOptional()
    @AutoMap()
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateGen: Date;

}