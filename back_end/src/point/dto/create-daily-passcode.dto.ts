
import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateDailyPasscodeDto {
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    qrId: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsString()
    storeId: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsNumber()
    dailyPoint: number;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    limitCount: number;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    expireDateFrom: Date;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    expireDateTo: Date;

}