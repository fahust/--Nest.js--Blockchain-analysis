import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from '@user/service/user.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
    Strategy,
    'jwtRefresh'
) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            jsonWebTokenOptions: {
                ignoreNotBefore: false
            },
            secretOrKey: configService.get<string>(
                'authentication.jwt.refreshToken.secretKey'
            )
        });
    }

    async validate(payload) {
        return await this.userService.findOneById(payload.sub);
    }
}
