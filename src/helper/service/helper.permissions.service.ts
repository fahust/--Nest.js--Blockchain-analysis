import { PERMISSIONS } from '@shared/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperPermissionService {
    public hasStudioAccess(permissions: string[]): boolean {
        return permissions.includes(PERMISSIONS.ACCESS);
    }

    public hasEmailVerified(permissions: string[]): boolean {
        return permissions.includes(PERMISSIONS.EMAIL_VERIFIED);
    }

    public isOnboarded(permissions: string[]): boolean {
        return permissions.includes(PERMISSIONS.ONBOARDED);
    }

    public hasFullAccess(userPermissionList: string[]): boolean {
        const warlockPermissions = Object.values(PERMISSIONS);
        return warlockPermissions.every(
            (warlockPermission, index) =>
                warlockPermission === userPermissionList[index]
        );
    }
}
