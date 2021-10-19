import { AutoMap } from "@automapper/classes";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { Role } from "src/auth/enum/role.enum";
import { UserStatus } from "../enum/status.enum";


export class ViewUserDto {
    @ApiPropertyOptional()
    @AutoMap()
    readonly userName: string;

    @ApiPropertyOptional()
    @AutoMap()
    readonly phone: string;

    @ApiPropertyOptional()
    @AutoMap()
    @IsOptional()
    @IsEnum(UserStatus)
    readonly status: string;

    @ApiPropertyOptional()
    @AutoMap()
    @IsOptional()
    @IsEnum(Role)
    readonly roles: string;
  
}