import { AutoMap } from "@automapper/classes";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { StoreStatus } from "../enum/status.store.enum";

export class StoreViewDto {
    @ApiPropertyOptional()
    @AutoMap()
    readonly name: string;

    @ApiPropertyOptional()
    @AutoMap()
    readonly address: string;

    @ApiPropertyOptional()
    @AutoMap()
    readonly phone: string;
    
    @ApiPropertyOptional()
    @AutoMap()
    readonly timeActive: string;

    @ApiPropertyOptional()
    @AutoMap()
    @IsOptional()
    @IsEnum(StoreStatus)
    readonly status: string;
  
}