import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthJwtGuard } from '@authentication/decorator/authentication.decorator';
import { PermissionGuard } from '@authentication/guard/permission.guard';

export const Permission = (permission: string) => {
    return applyDecorators(
        SetMetadata('permission', permission),
        AuthJwtGuard(),
        UseGuards(PermissionGuard)
    );
};
