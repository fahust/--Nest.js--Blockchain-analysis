import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor
} from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import SendGrid, { MailDataRequired } from '@sendgrid/mail';
import { Job } from 'bull';
import { LoggerService } from '@logger/service/logger.service';

@Processor('mail')
export class MailConsumer {
    constructor(
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService
    ) {
        SendGrid.setApiKey(
            this.configService.get<string>('mail.sendgridApiKey')
        );
    }

    @OnQueueActive()
    onActive(job: Job) {
        this.loggerService.debug(
            `Processing job ${job.id} of type ${job.name}`,
            'MailConsumer',
            'onActive',
            job.data
        );
    }

    @OnQueueCompleted()
    onComplete(job: Job, result: any) {
        this.loggerService.debug(
            `Completed job ${job.id} of type ${job.name}`,
            'MailConsumer',
            'onComplete',
            result
        );
    }

    @OnQueueFailed()
    onError(job: Job, error: any) {
        this.loggerService.error(
            `Failed job ${job.id} of type ${job.name}: ${error.message}`,
            'MailConsumer',
            'onError',
            error.stack
        );
    }

    @Process('send')
    async handleSend(job: Job<MailDataRequired>) {
        const sendGridSandBoxMode =
            this.configService.get<string>('mail.sandboxMode');
        const isSendGridSandBoxModeEnabled = sendGridSandBoxMode === 'true';

        return SendGrid.send({
            ...job.data,
            mailSettings: {
                sandboxMode: {
                    enable: isSendGridSandBoxModeEnabled
                }
            }
        });
    }
}
