import { DATABASE_CONNECTION_NAME } from '@database/constant/database.constant';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticController } from '@analytic/controller/analytic.controller';
import {
    AnalyticDatabaseName,
    AnalyticEntity,
    AnalyticSchema
} from '@analytic/schema/analytic.schema';
import { AnalyticService } from '@analytic/service/analytic.service';
import { UserModule } from '@user/module/user.module';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: AnalyticEntity.name,
                    schema: AnalyticSchema,
                    collection: AnalyticDatabaseName
                }
            ],
            DATABASE_CONNECTION_NAME
        ),
        UserModule
    ],
    exports: [AnalyticService],
    providers: [AnalyticService],
    controllers: [AnalyticController]
})
export class AnalyticModule {}
