import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEthereumAddress,
    IsBoolean,
    IsOptional,
    IsArray,
    IsEnum
} from 'class-validator';
import { AssetTransfersCategory, AssetTransfersOrder } from 'alchemy-sdk';

export class GetPlaformLogsByAddressRequestDTO {
    @IsOptional()
    @IsString()
    @IsEthereumAddress()
    @ApiProperty({
        type: String,
        required: false,
        description: 'Contract address to search logs',
        example: '0x4aE0Ce5D513FF0f3892Fc3CfA352325FbecD696c'
    })
    addressUser: string;

    @IsNotEmpty()
    @IsBoolean()
    @ApiProperty({
        type: Boolean,
        description: 'Return metadata of nfts if is true',
        example: true
    })
    withMetadata: boolean;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: AssetTransfersOrder.ASCENDING,
        description: 'Return metadata of nfts if is true',
        example: true
    })
    order: AssetTransfersOrder.ASCENDING;
}

export class GetLogsBodyRequestDTO {
    @IsOptional()
    @IsString()
    @IsEthereumAddress()
    @ApiProperty({
        type: String,
        required: false,
        description: 'Contract address to search logs',
        example: '0x4aE0Ce5D513FF0f3892Fc3CfA352325FbecD696c'
    })
    address: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: Number,
        description: 'Start block to search events logs',
        example: '0x0'
    })
    fromBlock: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: Number,
        description: 'End block to search events logs',
        example: 'Latest'
    })
    toBlock: string;

    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        type: [String],
        description: 'Array of hash topics you want to search',
        example: ['0x4aE0Ce5D513FF0f3892Fc3CfA352325FbecD696c']
    })
    topics: Array<string>;
}

export class BestUsersRequestDto {
    @IsOptional()
    @IsArray()
    @IsEthereumAddress({ each: true })
    @ApiProperty({
        required: false,
        type: [String],
        description: 'Contract address to search logs',
        example: ['0xbBdD5a3159C520927ec0b9eb11CACbf970d9fd65']
    })
    addresses: Array<string>;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Start date for block to search events logs',
        example: '2021-01-01T12:00:00Z'
    })
    fromDate: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'End date for block to search events logs',
        example: '2022-07-01T12:00:00Z'
    })
    toDate: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'search block by month, days, year start',
        example: 'days'
    })
    typeDate: string;

    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        type: [String],
        description: 'Array of hash topics you want to search',
        example: [
            '0xfa76a4010d9533e3e964f2930a65fb6042a12fa6ff5b08281837a10b0be7321e'
        ]
    })
    topics: [string];
}

export class GetAssetTransfersRequestDTO {
    @IsOptional()
    @ApiProperty({
        required: false,
        type: [String],
        description: 'Contract address to search asset transfers',
        example: ['0xbBdD5a3159C520927ec0b9eb11CACbf970d9fd65']
    })
    contractAddresses: Array<string>;

    @IsNotEmpty()
    @ApiProperty({
        required: true,
        type: [String],
        description: 'An array of categories to get transfers for.',
        example: ['erc20', 'erc721']
    })
    category: [AssetTransfersCategory];

    @IsOptional()
    @ApiProperty({
        required: false,
        type: Boolean,
        description: 'Return metadata attached to nfts',
        example: true
    })
    withMetadata: boolean;

    @IsOptional()
    @ApiProperty({
        required: false,
        type: Boolean,
        description:
            'Whether to exclude transfers with zero value. Note that zero value is different than null value. Defaults to `false` if omitted.',
        example: false
    })
    excludeZeroValue: boolean;

    @IsEnum(AssetTransfersOrder, {
        message: 'order must be a valid AssetTransfersOrder'
    })
    @ApiProperty({
        name: 'order',
        enum: AssetTransfersOrder,
        description: 'Order to sort result',
        example: 'asc'
    })
    order: AssetTransfersOrder;

    @IsString()
    @IsEthereumAddress()
    @IsOptional()
    @ApiProperty({
        required: false,
        type: String,
        description: 'Search assets only transfered to this address ethereum',
        example: '0xbe05aef9432fab77dbd9a7cff01aae797c2596e2'
    })
    fromAddress: string;

    @IsString()
    @IsEthereumAddress()
    @IsOptional()
    @ApiProperty({
        required: false,
        type: String,
        description: 'Search assets only transfered to this address ethereum',
        example: '0xbe05aef9432fab77dbd9a7cff01aae797c2596e2'
    })
    toAddress: string;
}

export class GetTokenPurchaseLogsRequestDTO {
    @IsString()
    @IsEthereumAddress()
    @IsOptional()
    @ApiProperty({
        required: false,
        type: String,
        description:
            'Search logs tokens transfer attached to this address user',
        example: '0xbe05aef9432fab77dbd9a7cff01aae797c2596e2'
    })
    addressUser: string;

    @IsOptional()
    @ApiProperty({
        required: false,
        type: String,
        description: 'Start date for block to search events logs',
        example: '2021-01-01T12:00:00Z'
    })
    fromDate: string | Date;

    @IsOptional()
    @ApiProperty({
        required: false,
        type: String,
        description: 'End date for block to search events logs',
        example: '2022-06-01T12:00:00Z'
    })
    toDate: string | Date;
}
