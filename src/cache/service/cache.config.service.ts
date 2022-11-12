import {
    CacheModuleOptions,
    CacheOptionsFactory,
    Injectable
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createCacheOptions(): CacheModuleOptions {
        return {
            stored: redisStore,
            url:
                this.configService.get<string>('app.env') === 'test'
                    ? this.configService.get<string>('cache.memoryServerUrl')
                    : this.configService.get<string>('cache.url')
        };
    }
}
