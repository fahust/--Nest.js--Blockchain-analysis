import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import winston, { LoggerOptions } from 'winston';
import { MongoDB, MongoDBConnectionOptions } from 'winston-mongodb';

@Injectable()
export class LoggerOptionService {
    private readonly host: string;
    private readonly database: string;
    private readonly options: string;
    private readonly env: string;

    constructor(private readonly configService: ConfigService) {
        this.env = this.configService.get<string>('app.env');
        this.host = this.configService.get<string>('database.host');
        this.database = this.configService.get<string>('database.name');

        /* istanbul ignore next */
        this.options = this.configService.get<string>('database.options')
            ? `?${this.configService.get<string>('database.options')}`
            : '';
    }

    createLogger(): LoggerOptions {
        const transports = [];

        if (this.env === 'test') {
            transports.push(new winston.transports.Console({ silent: true }));
        } else {
            const finalMongoOptions: MongoDBConnectionOptions = {
                db: `${this.host}/${this.database}${this.options}`,
                level: 'debug',
                name: 'mongodb',
                collection: 'logs',
                decolorize: true,
                tryReconnect: true,
                metaKey: 'data',
                options: {
                    useUnifiedTopology: true,
                    useNewUrlParser: true
                }
            };

            transports.push(new MongoDB(finalMongoOptions));
        }

        const loggerOptions: LoggerOptions = {
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.prettyPrint()
            ),
            transports
        };

        return loggerOptions;
    }
}
