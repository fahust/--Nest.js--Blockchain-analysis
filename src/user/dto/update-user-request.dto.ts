import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEmail,
    ArrayMaxSize,
    IsEthereumAddress,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested
} from 'class-validator';

class UserFavoriteWalletAddressDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        type: String,
        description: 'User favorite wallet address name',
        example: 'Alice MetaMask'
    })
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        type: String,
        required: false,
        description: 'User favorite wallet address description',
        example: 'External wallet'
    })
    description?: string;

    @IsMongoId({ each: true })
    @ApiProperty({
        type: [String],
        required: false,
        description: 'User favorite wallet address description',
        example: ['62ecda4af5e23ba42dc172a6']
    })
    tags: string[];

    @IsString()
    @IsNotEmpty()
    @IsEthereumAddress()
    @ApiProperty({
        type: String,
        description: 'User favorite wallet address',
        example: '0x4ae0ce5d513ff0f3892fc3Cfa352325fbecd696c'
    })
    walletAddress: string;
}

export class UpdateUserRequestDTO {
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        type: String,
        required: false,
        description: 'User First Name',
        example: 'Alice',
        minLength: 2,
        maxLength: 50
    })
    firstName?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        type: String,
        required: false,
        description: 'User Last Name',
        example: 'Smith',
        minLength: 2,
        maxLength: 50
    })
    lastName?: string;

    @IsOptional()
    // FR country code is used as default is no prefix is set
    @IsPhoneNumber('FR', {
        each: true,
        message: 'phones must only contain valid phone numbers'
    })
    @ApiProperty({
        type: [String],
        required: false,
        description: 'User phone numbers',
        example: ['+12345678901', '+12345678902']
    })
    phones?: string[];

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    @ApiProperty({
        type: String,
        description: 'UserName',
        example: 'JohnDoe',
        minLength: 2,
        maxLength: 50
    })
    userName?: string;

    @IsEmail()
    @IsOptional()
    @ApiProperty({
        type: String,
        description: 'Email',
        example: 'alice@smith.com'
    })
    email?: string;

    @IsOptional()
    @ArrayMaxSize(50)
    @ValidateNested({ each: true })
    @Type(() => UserFavoriteWalletAddressDTO)
    @ApiProperty({
        type: [UserFavoriteWalletAddressDTO],
        description: 'User favorite wallet addresses',
        required: false
    })
    favoriteWalletAddresses?: UserFavoriteWalletAddressDTO[];
}
