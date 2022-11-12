import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '@shared/enums';
import { LoggerService } from '@logger/service/logger.service';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(private readonly loggerService: LoggerService) {
        super();
    }

    handleRequest<TUser = any>(
        err: Record<string, any>,
        user: TUser,
        info: any
    ): TUser {
        if (!user && !err && !info) {
            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_JWT_ACCESS_TOKEN_ERROR,
                message: 'http.clientError.unauthorizedWithMessage',
                properties: {
                    message: 'User not found'
                }
            });
        }

        if (err || !user) {
            this.loggerService.error(
                info.message,
                'JwtGuard',
                'handleRequest',
                info
            );

            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_JWT_ACCESS_TOKEN_ERROR,
                message: 'http.clientError.unauthorizedWithMessage',
                properties: {
                    message: info.message
                }
            });
        }

        return user;
    }
}
