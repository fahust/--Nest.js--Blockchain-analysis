import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired } from '@sendgrid/mail';
import { Job, Queue } from 'bull';
import { HelperHashService } from '@helper/service/helper.hash.service';
import { IMailData } from '@shared/interfaces';
import { LoggerService } from '@logger/service/logger.service';

@Injectable()
export class MailProducer {
    private readonly from: string;
    constructor(
        @InjectQueue('mail') private mailQueue: Queue,
        private readonly helperHashService: HelperHashService,
        private readonly loggerService: LoggerService,
        private readonly configService: ConfigService
    ) {
        this.from = this.configService.get<string>('mail.sendgridMailFrom');
    }

    async send(mail: IMailData): Promise<Job<MailDataRequired>> {
        const job = await this.mailQueue.add(
            'send',
            { ...mail, from: this.from },
            {
                // We replace the default integer id with an uuid to avoid duplication
                jobId: this.helperHashService.uuid(4)
            }
        );

        this.loggerService.debug(
            `Job ${job.id} added to "${job.queue.name}" queue with "${job.name}" type`,
            'MailProducer',
            'send'
        );

        return job;
    }
}
