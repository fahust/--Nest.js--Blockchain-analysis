import { Body, Controller, Get, Post, Put, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserDocument } from '@user/schema/user.schema';
import { ethers } from 'ethers';
import { ApiTags } from '@nestjs/swagger';
import { AuthRefreshJwtGuard } from '@authentication/decorator/authentication.decorator';
import { GetUser } from '@authentication/decorator/get-user.decorator';
import { AuthenticationChallengeResponseDTO } from '@authentication/dto/authentication-challenge-response.dto';
import { Permission } from '@authentication/decorator/permission.decorator';
import { AuthenticationRequestDTO } from '@authentication/dto/authentication-request.dto';
import { AuthenticationResponseDTO } from '@authentication/dto/authentication-response.dto';
import { AuthenticationService } from '@authentication/service/authentication.service';
import { HelperHashService } from '@helper/service/helper.hash.service';
import { AuthenticationChallengeRequestDTO } from '@authentication/dto/authentication-challenge-request.dto';

@Controller({
    version: '1',
    path: 'authentication'
})
@ApiTags('Authentication')
export class AuthenticationController {
    public constructor(
        private authenticationService: AuthenticationService,
        private readonly helperHashService: HelperHashService
    ) {}

    @Post('/challenge')
    public async challenge(
        @Body()
        authenticationChallengeRequest: AuthenticationChallengeRequestDTO
    ): Promise<AuthenticationChallengeResponseDTO> {
        return this.authenticationService.challenge(
            authenticationChallengeRequest
        );
    }

    @Post('/')
    public async authenticate(
        @Body() authenticationRequest: AuthenticationRequestDTO
    ): Promise<AuthenticationResponseDTO> {
        return this.authenticationService.authentication(authenticationRequest);
    }

    @Get('/refresh')
    @AuthRefreshJwtGuard()
    public async refreshToken(
        @Req() req: Request,
        @GetUser() user: UserDocument
    ): Promise<AuthenticationResponseDTO> {
        return this.authenticationService.refreshToken(
            this.extractJwtFromRequest(req),
            user
        );
    }

    @Get('/api-keys')
    @Permission('access:studio')
    public async getUserApiKeys(@GetUser() user: UserDocument) {
        return { apiKey: user.apiKey, secretApiKey: user.secretApiKey };
    }

    @Put('/revoke-api-key')
    @Permission('access:studio')
    public async revokeUserApiKey(
        @GetUser() user: UserDocument
    ): Promise<string> {
        user.apiKey = this.helperHashService.uuid(4);
        user.save();
        return user.apiKey;
    }

    public extractJwtFromRequest(req: Request): string {
        return req.headers.authorization.substring('Bearer '.length);
    }

    @Get('/create-user')
    public async get(): Promise<any> {
        const wallet = ethers.Wallet.createRandom();
        const walletAddress = wallet.address;

        const challengePayload = {
            walletAddress
        };

        const { challenge } = await this.authenticationService.challenge(
            challengePayload
        );

        const signature = await wallet.signMessage(challenge);

        const authenticationPayload = {
            walletAddress,
            signature
        };

        const result = await this.authenticationService.authentication(
            authenticationPayload
        );

        return result;
    }

    @Post('/verify-email')
    public async emailVerification(
        @Query() query: { jwt: string }
    ): Promise<void> {
        await this.authenticationService.emailVerification(query.jwt);
    }
}
