import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from '@authentication/controller/authentication.controller';
import { ApiKeyStrategy } from '@authentication/guard/api-key/api-key.strategy';
import { JwtRefreshStrategy } from '@authentication/guard/jwt-refresh/jwt-refresh.strategy';
import { JwtStrategy } from '@authentication/guard/jwt/jwt.strategy';
import { SecretApiKeyStrategy } from '@authentication/guard/secret-api-key/secret-api-key.strategy';
import { AuthenticationService } from '@authentication/service/authentication.service';
import { MailModule } from '@mail/module/mail.module';
import { UserModule } from '@user/module/user.module';

@Module({
    imports: [JwtModule.register({}), UserModule, MailModule],
    exports: [AuthenticationService],
    providers: [
        AuthenticationService,
        JwtStrategy,
        JwtRefreshStrategy,
        ApiKeyStrategy,
        SecretApiKeyStrategy
    ],
    controllers: [AuthenticationController]
})
export class AuthenticationModule {}
