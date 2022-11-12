import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

@Schema({
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
})
export class salesByDatesEntity {
    @Prop({ type: Object, required: true, trim: true })
    @ApiProperty({
        type: Object,
        required: true,
        description: 'All claim events in array, with key date',
        example: {
            '22/02/2022': ['AnalyticDocument,AnalyticDocument,...'],
            '23/02/2022': ['AnalyticDocument']
        }
    })
    claim: Record<string, AnalyticDocument[]>;

    @Prop({ type: Object, required: true, trim: true })
    @ApiProperty({
        type: Object,
        required: true,
        description: 'All buy events in array, with key date',
        example: {
            '22/02/2022': ['AnalyticDocument,AnalyticDocument,...'],
            '23/02/2022': ['AnalyticDocument']
        }
    })
    buy: Record<string, AnalyticDocument[]>;

    @Prop({ type: Object, required: true, trim: true })
    @ApiProperty({
        type: Object,
        required: true,
        description: 'All auction events in array, with key date',
        example: {
            '22/02/2022': ['AnalyticDocument,AnalyticDocument,...'],
            '23/02/2022': ['AnalyticDocument']
        }
    })
    auction: Record<string, AnalyticDocument[]>;
}

@Schema({
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
})
export class AnalyticEntity {
    @Prop({ type: String, required: true, trim: true })
    @ApiProperty({
        type: String,
        required: true,
        description: 'type of contract and token',
        example: 'DROPERC721A'
    })
    typeContract: string;

    @Prop({ type: String, required: true, trim: true })
    @ApiProperty({
        type: String,
        required: true,
        description: 'hash of transaction blockchain',
        example: '0x0fzasf94...'
    })
    txHash: string;

    @Prop({ type: String, required: true, trim: true })
    @ApiProperty({
        type: String,
        required: true,
        description: 'name of event listened',
        example: 'transfer'
    })
    name: string;

    @Prop({ type: String, required: true, trim: true })
    @ApiProperty({
        type: String,
        required: true,
        description: "address of contract's emit event",
        example: '0x049fz49a...'
    })
    addressContract: string;

    @Prop({
        type: String,
        required: true,
        index: true
    })
    @ApiProperty({
        type: String,
        required: true,
        description: 'User Mongo ID',
        example: '62ed4e87ae8e12a17c19406d'
    })
    user: string;

    @Prop({ type: String, required: false, trim: true })
    @ApiProperty({
        type: String,
        required: false,
        default: '',
        description: 'value sended with transaction in wei native token',
        example: ''
    })
    value: string;

    @Prop({ type: mongoose.Schema.Types.Mixed, required: false })
    @ApiProperty({
        type: mongoose.Schema.Types.Mixed,
        required: true,
        description: 'datas contained into event',
        example:
            '{ startTokenId : "0", endTokenId: "0", baseURI : "ipfs://ipfsHash/10", encryptedBaseURI : "[]" }'
    })
    data?: unknown;

    @Prop({ type: String, required: true })
    @ApiProperty({
        type: String,
        required: true,
        description: 'datas contain into event',
        example: '22/02/2022'
    })
    createdAt?: string;
}

export const AnalyticDatabaseName = 'analytics';
export const AnalyticSchema = SchemaFactory.createForClass(AnalyticEntity);

export type AnalyticDocument = AnalyticEntity & mongoose.Document;
