import {
    CacheModuleOptions,
    CACHE_MANAGER,
    Inject,
    Injectable
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache, CachingConfig } from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly configService: ConfigService
    ) {}

    async get<T>(key: string): Promise<T> {
        return this.cacheManager.get<T>(key);
    }
    async set<T>(key: string, value: T, options?) {
        return this.cacheManager.set<T>(key, value, options);
    }

    async setNoLimit<T>(key: string, value: T) {
        return this.cacheManager.set<T>(key, value, { ttl: 0 });
    }

    async delete(key: string): Promise<void> {
        return this.cacheManager.del(key);
    }

    async reset(): Promise<void> {
        return this.cacheManager.reset();
    }

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
