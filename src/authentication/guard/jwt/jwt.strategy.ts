import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IJwtPayload } from '@shared/interfaces';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@user/service/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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
                'authentication.jwt.accessToken.secretKey'
            )
        });
    }

    async validate(payload: IJwtPayload) {
        return await this.userService.findOneById(payload.sub);
    }
}
