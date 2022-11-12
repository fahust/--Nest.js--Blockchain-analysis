import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested
} from 'class-validator';

class SocialDTO {
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: `User's twitter account`,
        example: 'johnDoe'
    })
    twitter?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        description: `User's instagram account`,
        example: 'johnDoe'
    })
    instagram?: string;
}

export class OnboardUserRequestDTO {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({
        description: 'User Email',
        example: 'john@doe.com'
    })
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        description: 'UserName',
        example: 'JohnDoe'
    })
    userName: string;

    @ValidateNested({ each: true })
    @Type(() => SocialDTO)
    social: SocialDTO;
}
