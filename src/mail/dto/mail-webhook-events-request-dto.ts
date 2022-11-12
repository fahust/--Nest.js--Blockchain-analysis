import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsEnum,
    IsString,
    ValidateNested
} from 'class-validator';
import { EventType } from '@shared/enums';

class WebhookEventDTO {
    @IsString()
    @ApiProperty({
        description: `The event origin email`,
        example: 'email@warlock.io'
    })
    email: string;

    @IsEnum(EventType)
    @ApiProperty({
        type: String,
        enum: EventType,
        description: `The event type`,
        example: 'group_unsubscribe'
    })
    event: EventType;
}

export class MailWebhookEventsRequestDTO {
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => WebhookEventDTO)
    @ApiProperty({
        type: [WebhookEventDTO],
        description: 'Webhook events'
    })
    events: WebhookEventDTO[];

    constructor(events: WebhookEventDTO[]) {
        this.events = events;
    }
}
