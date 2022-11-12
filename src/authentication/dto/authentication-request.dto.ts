import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsNotEmpty } from 'class-validator';
import { IsEthereumSignature } from '@authentication/decorator/authentication.decorator';

export class AuthenticationRequestDTO {
    @IsNotEmpty()
    @IsEthereumSignature()
    @ApiProperty({ description: 'Web3 signature', example: '...' })
    public signature: string;

    @IsEthereumAddress()
    @ApiProperty({
        description: 'Ethereum address',
        example: '0x0cE1A376d6CC69a6F74f27E7B1D65171fcB69C80'
    })
    public walletAddress: string;
}
