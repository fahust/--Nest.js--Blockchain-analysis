import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessageService } from '@message/service/message.service';

@Controller({
    version: '1',
    path: 'message'
})
@ApiTags('I18n')
export class MessageEnumController {
    constructor(private readonly messageService: MessageService) {}

    @Get('/languages')
    async languages(): Promise<{ languages: string[] }> {
        const languages: string[] = await this.messageService.getLanguages();
        return {
            languages
        };
    }
}
