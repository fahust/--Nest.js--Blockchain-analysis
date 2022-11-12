import { Global, Module } from '@nestjs/common';
import { LoggerOptionService } from '@logger/service/logger.option.service';
import { LoggerService } from '@logger/service/logger.service';

@Global()
@Module({
    providers: [LoggerOptionService, LoggerService],
    exports: [LoggerOptionService, LoggerService],
    imports: []
})
export class LoggerModule {}
