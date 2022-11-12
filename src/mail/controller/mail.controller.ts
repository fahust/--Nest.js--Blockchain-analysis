import {
    Body,
    CallHandler,
    Controller,
    ExecutionContext,
    forwardRef,
    HttpCode,
    HttpStatus,
    Inject,
    Injectable,
    NestInterceptor,
    Post,
    UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventType } from '@shared/enums';
import { LoggerService } from '@logger/service/logger.service';
import { MailService } from '@mail/service/mail.service';
import { UserService } from '@user/service/user.service';
import { MailWebhookEventsRequestDTO } from '@mail/dto/mail-webhook-events-request-dto';

@Injectable()
export class EventWrapperInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler) {
        const httpContext = context.switchToHttp();
        const req = httpContext.getRequest();
        req.body = new MailWebhookEventsRequestDTO(req.body);

        return next.handle();
    }
}

@Controller({
    version: '1',
    path: 'mail-webhook'
})
@ApiTags('MailWebhook')
export class MailWebhookController {
    public constructor(
        private readonly mailService: MailService,
        private readonly loggerService: LoggerService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService
    ) {
        //
    }

    @UseInterceptors(EventWrapperInterceptor)
    @Post('/events')
    @HttpCode(HttpStatus.OK)
    public async events(
        @Body() { events }: MailWebhookEventsRequestDTO
    ): Promise<void> {
        await Promise.all(
            events.map(async event => {
                if (
                    ![
                        EventType.GROUP_RESUBSCRIBE,
                        EventType.GROUP_UNSUBSCRIBE
                    ].includes(event.event)
                ) {
                    return;
                }

                try {
                    const user = await this.userService.findOne({
                        email: event.email
                    });
                    if (user) {
                        await this.userService.update(user._id, {
                            hasNewsletter:
                                event.event == EventType.GROUP_RESUBSCRIBE
                        });
                    }
                } catch (e) {
                    this.loggerService.error(
                        `Impossible to update newsletter settings for user with email: ${event.email}`,
                        'MailWebhookController',
                        'events'
                    );
                }
            })
        );
    }
}
