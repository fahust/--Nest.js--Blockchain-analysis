import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '@mail/module/mail.module';
import { UserController } from '@user/controller/user.controller';
import {
    UserDatabaseName,
    UserEntity,
    UserSchema
} from '@user/schema/user.schema';
import { UserBulkService } from '@user/service/user.bulk.service';
import { UserService } from '@user/service/user.service';

@Module({
    imports: [
        JwtModule.register({}),
        forwardRef(() => MailModule),
        MongooseModule.forFeature(
            [
                {
                    name: UserEntity.name,
                    schema: UserSchema,
                    collection: UserDatabaseName
                }
            ],
            'warlock'
        )
    ],
    exports: [UserService, UserBulkService],
    providers: [UserService, UserBulkService],
    controllers: [UserController]
})
export class UserModule {}
