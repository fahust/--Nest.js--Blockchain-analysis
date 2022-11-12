import { CacheConfigService } from '@cache/service/cache.config.service';
import { CacheService } from '@cache/service/cache.service';
import {
    CacheModule as NestJsCacheModule,
    Global,
    Module
} from '@nestjs/common';

@Global()
@Module({
    controllers: [],
    providers: [CacheService],
    exports: [CacheService],
    imports: [
        NestJsCacheModule.registerAsync({
            isGlobal: true,
            useClass: CacheConfigService
        })
    ]
})
export class CacheModule {}
