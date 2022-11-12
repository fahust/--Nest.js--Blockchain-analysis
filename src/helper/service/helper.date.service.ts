import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment-timezone';

@Injectable()
export class HelperDateService {
    private readonly tz: string;

    constructor(private readonly configService: ConfigService) {
        this.tz = this.configService.get<string>('app.timezone');
    }

    fromHumanToNumber(date: string) {
        const format = date.match(/[a-zA-Z]+/g)[0];
        const num = date.match(/\d+/g)[0];
        return moment.duration(num, format as any).asSeconds();
    }
}
