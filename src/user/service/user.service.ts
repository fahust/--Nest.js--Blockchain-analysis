import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt';
import parsePhoneNumber from 'libphonenumber-js';
import { Model } from 'mongoose';
import { DatabaseEntity } from '@database/decorator/database.decorator';
import { HelperHashService } from '@helper/service/helper.hash.service';
import { IUserCreate } from '@shared/interfaces';
import { EMAIL_TEMPLATES } from '@shared/constants';
import { ENUM_USER_STATUS_CODE_ERROR } from '@shared/enums';
import { LoggerService } from '@logger/service/logger.service';
import { MailProducer } from '@mail/producer/mail.producer';
import { UserDocument, UserEntity } from '@user/schema/user.schema';
import { UpdateUserRequestDTO } from '@user/dto/update-user-request.dto';

@Injectable()
export class UserService {
    private readonly tokenSecretToken: string;
    private readonly tokenExpirationTime: string;
    private readonly studioUrl: string;

    public constructor(
        @DatabaseEntity(UserEntity.name)
        private readonly userModel: Model<UserDocument>,
        private readonly helperHashService: HelperHashService,
        private readonly loggerService: LoggerService,
        private readonly mailProducer: MailProducer,
        private readonly configService: ConfigService,
        private readonly jwt: JwtService
    ) {
        this.tokenSecretToken =
            this.configService.get<string>('mail.jwt.secretKey');
        this.tokenExpirationTime = this.configService.get<string>(
            'mail.jwt.expirationTime'
        );
        this.studioUrl = this.configService.get<string>('app.studioUrl');
    }

    public async createOne({
        walletAddress
    }: IUserCreate): Promise<UserDocument> {
        return await this.userModel.create({
            walletAddress,
            apiKey: this.helperHashService.uuid(),
            secretApiKey: this.helperHashService.uuid(),
            salt: this.helperHashService.randomSalt(12)
        });
    }

    public async findOneById(id: string): Promise<UserDocument> {
        return this.userModel.findById(id).lean();
    }

    public async findOne(find: Record<string, any>): Promise<UserDocument> {
        const user = this.userModel.findOne(find);
        return user.lean();
    }

    public async findOneOrCreate({
        walletAddress
    }: IUserCreate): Promise<UserDocument> {
        const user = await this.userModel.findOne({ walletAddress });
        if (user) {
            return user;
        }
        return await this.createOne({ walletAddress });
    }

    public async update(
        id: string,
        data: Record<string, any>
    ): Promise<UserDocument> {
        const user = await this.userModel
            .findByIdAndUpdate(id, data)
            .setOptions({ new: true });

        if (!user) {
            this.loggerService.error(
                `No user found with id ${id}`,
                'UserService',
                'updateUser'
            );

            throw new NotFoundException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_SERVICE_USER_NOT_FOUND_ERROR,
                message: 'user.update.error.userNotFound'
            });
        }

        if (data?.email !== user.email) {
            await this.sendEmail(id, data.email, EMAIL_TEMPLATES.verifyEmail);
        }

        return user;
    }

    public async addPermission(
        id: string,
        permission: string
    ): Promise<UserDocument> {
        const user = await this.userModel
            .findByIdAndUpdate(id, { $addToSet: { permissions: permission } })
            .setOptions({ new: true });

        if (!user) {
            this.loggerService.error(
                `No user found with id ${id}`,
                'UserService',
                'updateUser'
            );

            throw new NotFoundException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_SERVICE_USER_NOT_FOUND_ERROR,
                message: 'user.addPermission.error.userNotFound'
            });
        }

        return user;
    }

    public async createEmailToken(
        userId: string,
        email: string
    ): Promise<string> {
        return this.jwt.signAsync(
            {
                sub: userId,
                email
            },
            {
                secret: this.tokenSecretToken,
                expiresIn: this.tokenExpirationTime
            }
        );
    }

    public async sendEmail(userId: string, email: string, templateId: string) {
        const emailToken = await this.createEmailToken(userId, email);
        const confirmationUrl = `${this.studioUrl}/user/validate/${emailToken}`;

        return this.mailProducer.send({
            to: email,
            templateId,
            dynamicTemplateData: {
                confirmationUrl,
                email
            }
        });
    }

    public async formatAndUpdate(
        id: string,
        data: Partial<UpdateUserRequestDTO>
    ): Promise<UserDocument> {
        if (data.phones) {
            data.phones = data.phones.map(phone => {
                return parsePhoneNumber(phone, 'FR').formatInternational();
            });
        }

        return this.update(id, data);
    }

    public async getUserWithTags(id: string): Promise<UserDocument> {
        return this.userModel
            .findById(id)
            .populate('tags')
            .select('tags')
            .lean();
    }

    public async removeTag(id: string, tagId: string): Promise<UserDocument> {
        const user = await this.userModel
            .findByIdAndUpdate(id, {
                $pull: {
                    'favoriteWalletAddresses.$[].tags': tagId
                }
            })
            .setOptions({ new: true });

        if (!user) {
            this.loggerService.error(
                `No user found with id ${id}`,
                'UserService',
                'deleteTag'
            );

            throw new NotFoundException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USER_SERVICE_USER_NOT_FOUND_ERROR,
                message: 'user.removeTag.error.userNotFound'
            });
        }

        return user;
    }

    public async getSaltByUserId(id: string): Promise<UserDocument> {
        return this.userModel.findById(id).select('salt');
    }

    public async updateClaimedTokenList(
        userId: string,
        claimedTokenList: string[]
    ): Promise<UserDocument> {
        return this.userModel
            .findByIdAndUpdate(userId, {
                $addToSet: {
                    tokens: claimedTokenList
                }
            })
            .setOptions({ new: true });
    }
}
