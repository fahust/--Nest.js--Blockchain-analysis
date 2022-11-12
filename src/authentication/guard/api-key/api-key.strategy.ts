import { Request } from 'express';
import Strategy from 'passport-headerapikey';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '@shared/enums';
import { UserService } from '@user/service/user.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
    constructor(private readonly userService: UserService) {
        super(
            { header: 'X-API-KEY', prefix: '' },
            true,
            async (
                apiKey: string,
                verified: (
                    error: Error,
                    user?: Record<string, any>,
                    info?: string | number
                ) => Promise<void>,
                req: Request
            ) => this.validate(apiKey, verified, req)
        );
    }

    async validate<TUser = any>(
        apiKey: string,
        verified: (
            error: Error,
            user?: TUser,
            info?: string | number
        ) => Promise<void>,
        req: any
    ) {
        req.apiKey = apiKey;

        const user = await this.userService.findOne({ apiKey });

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
