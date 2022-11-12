import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthenticationResponseDTO {
    @IsString()
    @ApiProperty({
        description: 'Access Json Web Token'
    })
    public accessJwt: string;

    @IsString()
    @ApiProperty({
        description: 'Refresh Json Web Token'
    })
    public refreshJwt: string;
}
