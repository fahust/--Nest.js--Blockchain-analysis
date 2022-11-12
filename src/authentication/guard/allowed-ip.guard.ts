import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { LoggerService } from '@logger/service/logger.service';

@Injectable()
export class AllowedIpGuard implements CanActivate {
    private readonly allowedIps: string[];

    constructor(
        private readonly loggerService: LoggerService,
        private readonly configService: ConfigService
    ) {
        this.allowedIps = this.configService.get<string[]>(
            'authentication.allowedIps'
        );
    }

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip;

        const isAuthorized =
            this.allowedIps.includes('*') || this.allowedIps.includes(ip);

        if (!isAuthorized) {
            this.loggerService.error(
                `${ip} is not allowed to access this resource`,
                'allowedIpGuard',
                'canActivate',
                null
            );
        }

        return isAuthorized;
    }
}
