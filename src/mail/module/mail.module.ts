import { BullModule } from '@nestjs/bull';
import { forwardRef, Global, Module } from '@nestjs/common';
import { MailConsumer } from '@mail/consumer/mail.consumer';
import { MailWebhookController } from '@mail/controller/mail.controller';
import { MailProducer } from '@mail/producer/mail.producer';
import { MailService } from '@mail/service/mail.service';
import { UserModule } from '@user/module/user.module';

@Global()
@Module({
    controllers: [MailWebhookController],
    providers: [MailProducer, MailConsumer, MailService],
    exports: [MailProducer, MailService],
    imports: [
        forwardRef(() => UserModule),
        BullModule.registerQueue({
            name: 'mail'
        })
    ]
})
export class MailModule {}
