// import { PartialType } from '@nestjs/mapped-types';
// import { CreateSendMailDto } from './create-schedule-mail.dto';

// export class UpdateSendMailDto extends PartialType(CreateSendMailDto) {}

import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateSendMailDto {
    
    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    readonly body: string;

    @ApiProperty()
    @AutoMap()
    @IsNotEmpty()
    readonly subject: string;

}