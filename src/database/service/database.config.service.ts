import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    MongooseModuleOptions,
    MongooseOptionsFactory
} from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseService implements MongooseOptionsFactory {
    private readonly memoryServerHost: string;
    private readonly host: string;
    private readonly database: string;
    private readonly debug: boolean;
    private readonly options: string;
    private readonly env: string;

    constructor(private readonly configService: ConfigService) {
        this.env = this.configService.get<string>('app.env');
        this.host = this.configService.get<string>('database.host');
        this.memoryServerHost = this.configService.get<string>(
            'database.memoryServerHost'
        );
        this.database = this.configService.get<string>('database.name');
        this.debug = this.configService.get<boolean>('database.debug');

        /* istanbul ignore next */
        this.options = this.configService.get<string>('database.options')
            ? `?${this.configService.get<string>('database.options')}`
            : '';
    }

    createMongooseOptions(): MongooseModuleOptions {
        let uri = `${this.host}`;

        if (this.env === 'test') {
            uri = `${this.memoryServerHost}`;
        }

        if (this.database) {
            uri = `${uri}/${this.database}${this.options}`;
        }

        /* istanbul ignore next */
        if (this.env !== 'production') {
            mongoose.set('debug', this.debug);
        }

        const mongooseOptions: MongooseModuleOptions = {
            uri,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
            // useMongoClient: true
        };

        return mongooseOptions;
    }
}
