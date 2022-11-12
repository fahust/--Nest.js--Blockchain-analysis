import { SHA256 } from 'crypto-js';
import { ethers } from 'ethers';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '@cache/service/cache.service';
import { HelperDateService } from '@helper/service/helper.date.service';
import { HelperHashService } from '@helper/service/helper.hash.service';
import { IJwtEmailPayload, IJwtPayload } from '@shared/interfaces';
import { ENUM_AUTH_STATUS_CODE_ERROR } from '@shared/enums';
import { PERMISSIONS } from '@shared/constants';
import { LoggerService } from '@logger/service/logger.service';
import { MailService } from '@mail/service/mail.service';
import { MessageService } from '@message/service/message.service';
import { UserDocument } from '@user/schema/user.schema';
import { UserService } from '@user/service/user.service';
import { AuthenticationChallengeRequestDTO } from '@authentication/dto/authentication-challenge-request.dto';
import { AuthenticationChallengeResponseDTO } from '@authentication/dto/authentication-challenge-response.dto';
import { AuthenticationRequestDTO } from '@authentication/dto/authentication-request.dto';
import { AuthenticationResponseDTO } from '@authentication/dto/authentication-response.dto';

@Injectable()
export class AuthenticationService {
    private readonly accessTokenSecretToken: string;
    private readonly accessTokenExpirationTime: string;
    private readonly accessTokenNotBeforeExpirationTime: string;

    private readonly refreshTokenSecretToken: string;
    private readonly refreshTokenExpirationTime: string;
    private readonly refreshTokenNotBeforeExpirationTime: string;

    constructor(
        private readonly loggerService: LoggerService,
        private readonly messageService: MessageService,
        private readonly configService: ConfigService,
        private readonly helperDateService: HelperDateService,
        private readonly helperHashService: HelperHashService,
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly cacheService: CacheService,
        private jwt: JwtService,
    ) {
        this.accessTokenSecretToken = this.configService.get<string>(
            'authentication.jwt.accessToken.secretKey'
        );
        this.accessTokenExpirationTime = this.configService.get<string>(
            'authentication.jwt.accessToken.expirationTime'
        );
        this.accessTokenNotBeforeExpirationTime =
            this.configService.get<string>(
                'authentication.jwt.accessToken.notBeforeExpirationTime'
            );

        this.refreshTokenSecretToken = this.configService.get<string>(
            'authentication.jwt.refreshToken.secretKey'
        );
        this.refreshTokenExpirationTime = this.configService.get<string>(
            'authentication.jwt.refreshToken.expirationTime'
        );
        this.refreshTokenNotBeforeExpirationTime =
            this.configService.get<string>(
                'authentication.jwt.refreshToken.notBeforeExpirationTime'
            );
    }

    public nonceCacheKey(walletAddress: string): string {
        return `${walletAddress}:nonce`;
    }

    public jwtCacheKey(walletAddress: string): string {
        return `${walletAddress}:jwt`;
    }

    async createAccessToken(payload: Record<string, any>): Promise<string> {
        return await this.jwt.signAsync(payload, {
            secret: this.accessTokenSecretToken,
            expiresIn: this.accessTokenExpirationTime,
            notBefore: this.accessTokenNotBeforeExpirationTime
        });
    }

    async isValidAccessToken(token: string): Promise<boolean> {
        const jwt: IJwtPayload = await this.jwt.verifyAsync(token, {
            secret: this.accessTokenSecretToken
        });

        return jwt !== null;
    }

    async createRefreshToken(
        payload: IJwtPayload,
        test?: boolean
    ): Promise<string> {
        return this.jwt.sign(payload, {
            secret: this.refreshTokenSecretToken,
            expiresIn: this.refreshTokenExpirationTime,
            notBefore: test ? '0' : this.refreshTokenNotBeforeExpirationTime
        });
    }

    async validateRefreshToken(token: string): Promise<boolean> {
        const jwt: IJwtPayload = await this.jwt.verifyAsync(token, {
            secret: this.refreshTokenSecretToken
        });

        return jwt !== null;
    }

    public verifyWeb3Signature(
        challenge: string,
        signature: string,
        walletAddress: string
    ): boolean {
        if (!signature.match(/^0x([A-Fa-f0-9]{130})$/)) {
            return false;
        }

        const recoveredWallet = ethers.utils.verifyMessage(
            challenge,
            signature
        );
        return recoveredWallet === walletAddress;
    }

    public async challengeMessage(
        walletAddress: string,
        nonce: string
    ): Promise<string> {
        const message = await this.messageService.get(
            'authentication.web3.challenge.message',
            {
                properties: { walletAddress, nonce }
            }
        );
        return message.toString();
    }

    public async cacheNonce(walletAddress: string): Promise<string> {
        const nonce = this.helperHashService.uuid(4);

        const result = await this.cacheService.set(
            this.nonceCacheKey(walletAddress),
            nonce,
            { ttl: 60 }
        );

        return result === 'OK' ? nonce : null;
    }

    public async getCachedNonce(walletAddress: string): Promise<string> {
        return await this.cacheService.get(this.nonceCacheKey(walletAddress));
    }

    public async cacheRefreshTokenHash(
        walletAddress: string,
        refreshJwt: string
    ) {
        const hash = SHA256(refreshJwt).toString();

        const result = await this.cacheService.set(
            this.jwtCacheKey(walletAddress),
            hash,
            {
                ttl: this.helperDateService.fromHumanToNumber(
                    this.refreshTokenExpirationTime
                )
            }
        );

        return result === 'OK' ? hash : null;
    }

    public async getCachedRefreshTokenHash(
        walletAddress: string
    ): Promise<string> {
        return await this.cacheService.get(this.jwtCacheKey(walletAddress));
    }

    public async deleteCachedRefreshTokenHash(
        walletAddress: string
    ): Promise<void> {
        await this.cacheService.delete(this.jwtCacheKey(walletAddress));
    }

    public async challenge(
        authenticationChallengeRequest: AuthenticationChallengeRequestDTO
    ): Promise<AuthenticationChallengeResponseDTO> {
        const { walletAddress } = authenticationChallengeRequest;

        const user = await this.userService.findOneOrCreate({ walletAddress });

        if (!user) {
            this.loggerService.error(
                `No user found for wallet ${walletAddress}`,
                'AuthenticationService',
                'challengeUser'
            );

            throw new NotFoundException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_USER_NOT_FOUND_ERROR,
                message: 'authentication.web3.error.userNotFound'
            });
        }

        const nonce = await this.cacheNonce(walletAddress);

        const challenge = await this.challengeMessage(walletAddress, nonce);

        this.loggerService.info(
            'User challenge',
            'AuthenticationService',
            'challengeUser',
            {
                userId: `ObjectId(${user.id})`,
                challenge
            }
        );

        return {
            challenge,
            nonce
        };
    }

    public async authentication(
        authenticationRequest: AuthenticationRequestDTO
    ): Promise<AuthenticationResponseDTO> {
        const { walletAddress, signature } = authenticationRequest;

        const nonce = await this.getCachedNonce(walletAddress);

        const challenge = await this.challengeMessage(walletAddress, nonce);

        if (
            this.verifyWeb3Signature(challenge, signature, walletAddress) !==
            true
        ) {
            this.loggerService.error(
                `Invalid signature provided for wallet address ${walletAddress}`,
                'AuthenticationService',
                'authenticationUser',
                { walletAddress, signature, challenge }
            );

            throw new BadRequestException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_INVALID_WEB3_SIGNATURE_ERROR,
                message: 'authentication.web3.error.invalidWeb3Signature'
            });
        }

        const user = await this.userService.findOne({ walletAddress });
        const { _id: userId } = user;

        const accessJwt = await this.createAccessToken({
            sub: userId
        });

        const refreshJwt = await this.createRefreshToken({ sub: userId }, true);

        await this.cacheRefreshTokenHash(walletAddress, refreshJwt);

        return { accessJwt, refreshJwt };
    }

    public async refreshToken(
        currentRefreshJwt: string,
        user: UserDocument
    ): Promise<AuthenticationResponseDTO> {
        const currentRefreshJwtHash = SHA256(currentRefreshJwt).toString();

        const previousRefreshJwtHash = await this.getCachedRefreshTokenHash(
            user.walletAddress
        );

        if (!previousRefreshJwtHash) {
            this.loggerService.error(
                'User not authenticated',
                'AuthenticationService',
                'refreshUserToken'
            );

            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_REFRESH_TOKEN_NOT_FOUND_ERROR,
                message: 'authentication.web3.error.refreshTokenNotFoundInCache'
            });
        }

        if (currentRefreshJwtHash !== previousRefreshJwtHash) {
            this.loggerService.error(
                `Hash does not match ${currentRefreshJwtHash} !== ${previousRefreshJwtHash}`,
                'AuthenticationService',
                'refreshUserToken'
            );

            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_GUARD_JWT_REFRESH_TOKEN_ERROR,
                message: 'authentication.web3.error.invalidRefreshTokenHash'
            });
        }

        const userId = user._id;

        const accessJwt = await this.createAccessToken({
            sub: userId
        });

        const refreshJwt = await this.createRefreshToken({ sub: userId }, true);

        await this.cacheRefreshTokenHash(user.walletAddress, refreshJwt);

        return { accessJwt, refreshJwt };
    }

    public async emailVerification(signedJwtEmailToken: string): Promise<void> {
        await this.isValidAccessToken(signedJwtEmailToken);

        const decodedJwtEmailToken = this.jwt.decode(
            signedJwtEmailToken
        ) as IJwtEmailPayload;

        const { sub: userId, email: jwtEmail } = decodedJwtEmailToken;

        const user = await this.userService.findOneById(userId);

        if (!user) {
            this.loggerService.error(
                `No user found for id ${userId}`,
                'AuthenticationService',
                'emailVerification'
            );

            throw new UnauthorizedException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_USER_NOT_FOUND_ERROR,
                message: 'authentication.email.error.userNotFound'
            });
        }

        const oldEmail = user.email;
        if (oldEmail && oldEmail !== jwtEmail) {
            await this.mailService.renameContact(oldEmail, jwtEmail);
        }

        await this.userService.update(user._id, { email: jwtEmail });
        await this.userService.addPermission(
            userId,
            PERMISSIONS.EMAIL_VERIFIED
        );
    }
}
