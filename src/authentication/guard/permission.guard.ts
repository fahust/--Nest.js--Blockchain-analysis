import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '@shared/enums';
import { PERMISSIONS } from '@shared/constants';
import { LoggerService } from '@logger/service/logger.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(
        private readonly loggerService: LoggerService,
        private reflector: Reflector
    ) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const guardPermission = this.reflector.get<string>(
            'permission',
            context.getHandler()
        );

        if (!guardPermission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const { user } = request;

        if (!user) {
            throw new ForbiddenException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_PERMISSION_GUARD_USER_NOT_FOUND,
                message: 'authentication.permission.error.user_not_found'
            });
        }

        const userPermissionList = user?.permissions;

        const hasRequiredPermission = (userPermissionList: string[]) =>
            userPermissionList.some(
                (userPermission: string) => guardPermission === userPermission
            );

        if (!hasRequiredPermission(userPermissionList)) {
            const getStatusCode = (type: string) => {
                const permissions = {
                    [PERMISSIONS.ACCESS]:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_PERMISSION_GUARD_HAS_NO_STUDIO_ACCESS,
                    [PERMISSIONS.ONBOARDED]:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_PERMISSION_GUARD_IS_NOT_ONBOARDED,
                    [PERMISSIONS.EMAIL_VERIFIED]:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_PERMISSION_GUARD_EMAIL_NOT_VERIFIED
                };
                return permissions[type];
            };

            throw new ForbiddenException({
                statusCode: getStatusCode(guardPermission),
                message: 'authentication.permission.error.forbidden',
                properties: {
                    requiredPermission: guardPermission,
                    userPermissions: userPermissionList
                }
            });
        }

        return true;
    }
}
