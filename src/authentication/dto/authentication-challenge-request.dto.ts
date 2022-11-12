import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class AuthenticationChallengeRequestDTO {
    @IsEthereumAddress()
    @ApiProperty({
        description: 'Ethereum address',
        example: '0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C80'
    })
    public walletAddress: string;
}
