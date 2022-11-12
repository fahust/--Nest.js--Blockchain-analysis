import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
    ) {}

    info(
        description: string,
        sClass: string,
        sFunction: string,
        data?: any
    ): void {
        this.logger.info(description, {
            data: {
                class: sClass,
                function: sFunction,
                data
            }
        });
    }

    debug(
        description: string,
        sClass: string,
        sFunction: string,
        data?: any
    ): void {
        this.logger.debug(description, {
            data: {
                class: sClass,
                function: sFunction,
                data
            }
        });
    }

    error(
        description: string,
        sClass: string,
        sFunction: string,
        error?: any
    ): void {
        this.logger.error(description, {
            data: {
                class: sClass,
                function: sFunction,
                error
            }
        });
    }
}
