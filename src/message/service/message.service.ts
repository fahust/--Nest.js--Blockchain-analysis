import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ENUM_MESSAGE_LANGUAGE } from '@message/constant/message.constant';
import {
    IMessage,
    IMessageOptions
} from '@message/interface/message.interface';

@Injectable()
export class MessageService {
    private readonly defaultLanguage: string;

    constructor(
        private readonly i18n: I18nService,
        private readonly configService: ConfigService
    ) {
        this.defaultLanguage = this.configService.get<string>('app.language');
    }

    async get(
        key: string,
        options?: IMessageOptions
    ): Promise<string | IMessage> {
        return this.i18n.translate(key, {
            lang: this.defaultLanguage,
            args: options && options.properties ? options.properties : undefined
        });
    }

    async getLanguages(): Promise<string[]> {
        return Object.values(ENUM_MESSAGE_LANGUAGE);
    }
}
