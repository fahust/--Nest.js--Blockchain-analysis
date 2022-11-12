import { Global, Module } from '@nestjs/common';
import { HelperDateService } from '@helper/service/helper.date.service';
import { HelperHashService } from '@helper/service/helper.hash.service';
import { HelperPermissionService } from '@helper/service/helper.permissions.service';
import { HelperService } from '@helper/service/helper.service';
import { HelperAnalyticService } from '@helper/service/helper.analytic.service';

@Global()
@Module({
    providers: [
        HelperService,
        HelperDateService,
        HelperHashService,
        HelperPermissionService
    ],
    exports: [
        HelperService,
        HelperDateService,
        HelperAnalyticService,
        HelperHashService,
        HelperPermissionService
    ],
    controllers: [],
    imports: []
})
export class HelperModule {}
