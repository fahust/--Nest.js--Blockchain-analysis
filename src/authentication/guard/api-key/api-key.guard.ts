import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '@shared/enums';
import { LoggerService } from '@logger/service/logger.service';

@Injectable()
export class ApiKeyGuard extends AuthGuard('api-key') {
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
                'apiKeyGuard',
                'handleRequest',
                err
            );

            const statusCode = info as string;

            if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_API_KEY_NOT_FOUND_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_API_KEY_NOT_FOUND_ERROR,
                    message: 'authentication.apiKey.error.notFound'
                });
            } else if (
                statusCode ===
                ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_API_KEY_UNAUTHORIZED_ERROR
            ) {
                throw new UnauthorizedException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_API_KEY_UNAUTHORIZED_ERROR,
                    message: 'authentication.apiKey.error.unauthorized'
                });
            }

            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_API_KEY_INVALID_ERROR,
                message: 'authentication.apiKey.error.invalid'
            });
        }

        return user;
    }
}
