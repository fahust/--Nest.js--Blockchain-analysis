import { Request } from 'express';
import Strategy from 'passport-headerapikey';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '@user/service/user.service';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '@shared/enums';

@Injectable()
export class SecretApiKeyStrategy extends PassportStrategy(
    Strategy,
    'secret-api-key'
) {
    constructor(private readonly userService: UserService) {
        super(
            { header: 'X-SECRET-API-KEY', prefix: '' },
            true,
            async (
                secretApiKey: string,
                verified: (
                    error: Error,
                    user?: Record<string, any>,
                    info?: string | number
                ) => Promise<void>,
                req: Request
            ) => this.validate(secretApiKey, verified, req)
        );
    }

    async validate<TUser = any>(
        secretApiKey: string,
        verified: (
            error: Error,
            user?: TUser,
            info?: string | number
        ) => Promise<void>,
        req: any
    ) {
        req.secretApiKey = secretApiKey;

        const user = await this.userService.findOne({ secretApiKey });

        if (!user) {
            verified(
                null,
                null,
                `${ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_API_KEY_NOT_FOUND_ERROR}`
            );
        }

        verified(null, { xUser: user } as any);
    }
}
