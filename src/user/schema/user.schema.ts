import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import {
    NetworkChainEnum,
    NetworkNameEnum,
    NetworkTypeEnum
} from '@shared/enums';

@Schema({ _id: false, versionKey: false })
export class UserStorage {
    @Prop({ type: String, required: false, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        required: false,
        description: 'Link to original S3 file',
        example: 'https://s3.amazonaws.com/original/user/thumbnail.png'
    })
    original?: string;

    @Prop({ type: String, required: false, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        required: false,
        description: 'Link to archived S3 file',
        example: 'https://s3.amazonaws.com/archive/user/thumbnail.png'
    })
    archive?: string;
}

const StorageSchema = SchemaFactory.createForClass(UserStorage);

@Schema({ _id: false, versionKey: false })
export class UserFavoriteWalletAddress {
    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'User favorite wallet address name',
        example: 'Alice MetaMask'
    })
    name: string;

    @Prop({ type: String, trim: true, required: false })
    @ApiProperty({
        type: String,
        required: false,
        description: 'User favorite wallet address description',
        example: 'External wallet'
    })
    description?: string;

    @Prop({
        type: [Types.ObjectId],
        ref: 'TagEntity',
        default: [],
        required: true
    })

    @Prop({ type: String, required: true, trim: true })
    @ApiProperty({
        type: String,
        description: 'User favorite wallet address',
        example: '0x4aE0Ce5D513FF0f3892Fc3CfA352325FbecD696c'
    })
    walletAddress: string;
}

const FavoriteWalletAddressSchema = SchemaFactory.createForClass(
    UserFavoriteWalletAddress
);

@Schema({ _id: false, versionKey: false })
export class UserPhysicalAddress {
    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'User physical address name',
        example: 'Home Tokyo'
    })
    name: string;

    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'User physical address street',
        example: '4 Chome-2-8 Shibakoen, Minato City'
    })
    street: string;

    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'User physical address city',
        example: 'Tokyo'
    })
    city: string;

    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'User physical address country',
        example: 'Japan'
    })
    country: string;

    @Prop({ type: String, required: true, trim: true })
    @ApiProperty({
        type: String,
        description: 'User physical address postal code',
        example: '105-001'
    })
    zipcode: string;

    @Prop({ type: String, required: false, trim: true })
    @ApiProperty({
        type: String,
        required: false,
        description: 'User physical address optional field',
        example: 'La Tour de Tokyo'
    })
    other?: string;
}

const PhysicalAddressSchema = SchemaFactory.createForClass(UserPhysicalAddress);

@Schema({ _id: false, versionKey: false })
export class UserNetwork {
    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'Blockchain network name',
        example: `${NetworkTypeEnum.Testnet}-${NetworkChainEnum.Ethereum}-${NetworkNameEnum.Goerli}`,
        examples: [
            `${NetworkTypeEnum.Mainnet}-${NetworkChainEnum.Ethereum}`,
            `${NetworkTypeEnum.Mainnet}-${NetworkChainEnum.Polygon}`,
            `${NetworkTypeEnum.Testnet}-${NetworkChainEnum.Ethereum}-${NetworkNameEnum.Goerli}`,
            `${NetworkTypeEnum.Testnet}-${NetworkChainEnum.Polygon}-${NetworkNameEnum.Mumbai}`
        ]
    })
    name: string;

    @Prop({ type: String, required: true, trim: true, uppercase: true })
    @ApiProperty({
        type: String,
        description: 'Blockchain network currency',
        example: 'ETH'
    })
    currency: string;

    @Prop({ type: Number, required: true, min: 0 })
    @ApiProperty({
        type: Number,
        description: 'Blockchain network id',
        example: 1,
        minimum: 0
    })
    chainId: number;

    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'Blockchain rpc endpoint',
        example: 'https://goerli.infura.io/v3'
    })
    rpcUrl: string;

    @Prop({ type: String, required: true, trim: true, lowercase: true })
    @ApiProperty({
        type: String,
        description: 'Blockchain websocket endpoint',
        example: 'ws://goerli.infura.io/v3'
    })
    websocketUrl: string;
}

const NetworkSchema = SchemaFactory.createForClass(UserNetwork);

@Schema({ _id: false, versionKey: false })
export class UserMarketplace {
    @Prop({ type: String, required: true, unique: false, trim: true }) // unique true AFTER CLEANING TESTS
    @ApiProperty({
        type: String,
        description: 'Address of the contract',
        example: '0x4aE0Ce5D513FF0f3892Fc3CfA352325FbecD696c'
    })
    contractAddress: string;

    @Prop({ type: NetworkSchema, required: true })
    @ApiProperty({
        type: UserNetwork,
        description: 'Network on which the marketplace is deployed'
    })
    network: UserNetwork;
}

const MarketplaceSchema = SchemaFactory.createForClass(UserMarketplace);

@Schema({ _id: false, versionKey: false })
export class UserSocial {
    @Prop({ type: String, required: false, trim: true })
    @ApiProperty({
        type: String,
        required: false,
        description: 'User twitter account name',
        example: 'https://twitter.com/sequoia'
    })
    twitter: string;

    @Prop({ type: String, required: false, trim: true })
    @ApiProperty({
        type: String,
        required: false,
        description: 'User instagram account name',
        example: 'https://www.instagram.com/thorbjornsson'
    })
    instagram: string;
}

const SocialSchema = SchemaFactory.createForClass(UserSocial);

@Schema({ timestamps: true, versionKey: false })
export class UserEntity {
    @Prop({ type: String, required: true, unique: true, trim: true })
    @ApiProperty({
        type: String,
        description: 'User Wallet Address',
        example: '0x4aE0Ce5D513FF0f3892Fc3CfA352325FbecD696c'
    })
    walletAddress: string;

    @Prop({
        type: String,
        default: 'en',
        trim: true,
        minLength: 2,
        maxLength: 7
    })
    @ApiProperty({
        type: String,
        description: 'User language',
        example: 'en',
        default: 'en',
        minLength: 2,
        maxLength: 7
    })
    locale: string;

    @Prop({
        type: String,
        required: false,
        unique: true,
        sparse: true,
        trim: true
    })
    @ApiProperty({
        type: String,
        required: false,
        description: 'User email',
        example: 'alice@xyz.com',
        default: null
    })
    email?: string;

    @Prop({ type: StorageSchema, required: false })
    @ApiProperty({
        type: UserStorage,
        required: false,
        description: 'The thumbnail of the user'
    })
    thumbnail?: UserStorage;

    @Prop({
        type: String,
        required: false,
        text: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    })
    @ApiProperty({
        type: String,
        required: false,
        description: 'User First Name',
        example: 'Alice'
    })
    firstName?: string;

    @Prop({
        type: String,
        required: false,
        text: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    })
    @ApiProperty({
        type: String,
        required: false,
        description: 'User Last Name',
        example: 'Smith',
        minLength: 2,
        maxLength: 50
    })
    lastName?: string;

    @Prop({
        type: String,
        required: false,
        text: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    })
    @ApiProperty({
        type: String,
        required: false,
        description: 'Brand name',
        example: "Alice's Brand",
        minLength: 2,
        maxLength: 50
    })
    brandName?: string;

    @Prop({
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    })
    @ApiProperty({
        type: String,
        description: 'User Username',
        example: 'cryptoAlice',
        minLength: 2,
        maxLength: 50
    })
    userName?: string;

    @Prop({ type: Array, required: false })
    @ApiProperty({
        type: [String],
        required: false,
        description: 'User phone numbers',
        example: ['+12345678901', '+12345678902']
    })
    phones?: string[];

    @Prop({ type: Boolean, required: true, default: false })
    @ApiProperty({
        type: Boolean,
        description: 'User has subscribed to newsletter',
        example: false,
        default: false
    })
    hasNewsletter: boolean;

    @Prop({ type: String, trim: true, index: true, unique: true, sparse: true })
    @ApiProperty({
        type: String,
        description: 'User api key',
        example: '3d9e383e-0f46-11ed-87a1-43bf63a658cb'
    })
    apiKey: string;

    @Prop({
        type: String,
        trim: true,
        index: true,
        unique: true,
        sparse: true
    })
    @ApiProperty({
        type: String,
        description: 'User api secret key',
        example: '479aaffc-0f46-11ed-a1df-9356fccf2385'
    })
    secretApiKey: string;

    @Prop({ type: String, required: true, select: false })
    @ApiProperty({
        type: String,
        description: 'User salt',
        example: '4a6952ec-0f46-11ed-8017-2f0d937890d2'
    })
    salt: string;

    @Prop({ type: [FavoriteWalletAddressSchema], required: false })
    @ApiProperty({
        type: [UserFavoriteWalletAddress],
        description: 'User favorite wallet addresses',
        required: false
    })
    favoriteWalletAddresses?: UserFavoriteWalletAddress[];

    @Prop({ type: PhysicalAddressSchema, required: false })
    @ApiProperty({
        type: UserPhysicalAddress,
        required: false,
        description: 'User physical address'
    })
    physicalAddress?: UserPhysicalAddress;

    @Prop({ type: [MarketplaceSchema], required: false })
    @ApiProperty({
        type: [UserMarketplace],
        required: false,
        description: 'User marketplaces'
    })
    marketplaces?: UserMarketplace[];

    @Prop({ type: [String] })
    @ApiProperty({
        type: [String],
        description: 'User permissions',
        example: ['access:studio', 'is:onboarded']
    })
    permissions: string[];

    @Prop({ type: SocialSchema, required: false })
    @ApiProperty({
        type: UserSocial,
        required: false,
        description: 'User social'
    })
    social?: UserSocial;

}

export const UserDatabaseName = 'users';
export const UserSchema = SchemaFactory.createForClass(UserEntity);

export type UserDocument = UserEntity & Document;
