import { Injectable } from '@nestjs/common';
import { DeleteResult } from 'mongodb';
import { Model } from 'mongoose';
import { DatabaseEntity } from '@database/decorator/database.decorator';
import { UserDocument, UserEntity } from '@user/schema/user.schema';

@Injectable()
export class UserBulkService {
    constructor(
        @DatabaseEntity(UserEntity.name)
        private readonly userModel: Model<UserDocument>
    ) {}

    async deleteMany(find: Record<string, any>): Promise<DeleteResult> {
        return this.userModel.deleteMany(find);
    }
}
