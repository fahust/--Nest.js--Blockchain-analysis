import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthenticationChallengeResponseDTO {
    @IsString()
    @ApiProperty({ description: 'Challenge', example: `Welcome to warlock` })
    public challenge: string;

    @IsString()
    @ApiProperty({
        description: 'Nonce',
        example: '1449c837-e13b-4416-bba0-1b28c90cc288'
    })
    public nonce: string;
}
