import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '@shared/enums';
import { LoggerService } from '@logger/service/logger.service';

@Injectable()
export class SecretApiKeyGuard extends AuthGuard('secret-api-key') {
    constructor(private readonly loggerService: LoggerService) {
        super();
    }

    handleRequest<TUser = any>(
        err: Record<string, any>,
        user: TUser,
        info: Error | string
    ): TUser {
        if (err || !user) {
            this.loggerService.error(
                info instanceof Error ? info.message : `${info}`,
                'secretApiKeyGuard',
                'handleRequest',
                err
            );

            const statusCode = info as string;

            if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_SECRET_API_KEY_NOT_FOUND_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_SECRET_API_KEY_NOT_FOUND_ERROR,
                    message: 'authentication.secretApiKey.error.notFound'
                });
            } else if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_SECRET_API_KEY_UNAUTHORIZED_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_SECRET_API_KEY_UNAUTHORIZED_ERROR,
                    message: 'authentication.secretApiKey.error.unauthorized'
                });
            }

            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_SECRET_API_KEY_INVALID_ERROR,
                message: 'authentication.secretApiKey.error.invalid'
            });
        }

        return user;
    }
}
