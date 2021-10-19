import { IsString, IsNotEmpty,MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    @MinLength(8)
    readonly password: string;
}
