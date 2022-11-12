import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AllowedIpGuard } from '@authentication/guard/allowed-ip.guard';
import { ApiKeyGuard } from '@authentication/guard/api-key/api-key.guard';
import { JwtRefreshGuard } from '@authentication/guard/jwt-refresh/jwt-refresh.guard';
import { JwtGuard } from '@authentication/guard/jwt/jwt.guard';
import { SecretApiKeyGuard } from '@authentication/guard/secret-api-key/secret-api-key.guard';

import { registerDecorator, ValidationOptions } from 'class-validator';

const ValidSignatureRule = (signature: string): boolean =>
    /^0x([A-Fa-f0-9]{130})$/.test(signature);

export function IsEthereumSignature(validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string): any => {
        registerDecorator({
            name: 'IsEthereumSignature',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: ValidSignatureRule
        });
    };
}

export function IpGuard() {
    return applyDecorators(UseGuards(AllowedIpGuard), ApiSecurity('ip'));
}

export function AuthApiKey() {
    return applyDecorators(
        UseGuards(ApiKeyGuard),
        ApiSecurity('X-API-KEY', ['X-API-KEY'])
    );
}

export function AuthJwtGuard() {
    return applyDecorators(UseGuards(JwtGuard), ApiBearerAuth());
}

export function AuthRefreshJwtGuard() {
    return applyDecorators(UseGuards(JwtRefreshGuard), ApiBearerAuth());
}

export function AuthSecretApiKey() {
    return applyDecorators(
        UseGuards(SecretApiKeyGuard),
        ApiSecurity('X-SECRET-API-KEY', ['X-SECRET-API-KEY'])
    );
}
