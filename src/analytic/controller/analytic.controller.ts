import { Body, Controller, Get, Param } from '@nestjs/common';
import { AnalyticService } from '@analytic/service/analytic.service';
import {
    AnalyticDocument,
    AnalyticEntity,
    salesByDatesEntity
} from '@analytic/schema/analytic.schema';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ethers } from 'ethers';
import { AuthJwtGuard } from '@authentication/decorator/authentication.decorator';
import { GetUser } from '@authentication/decorator/get-user.decorator';
import {
    OwnedNftsResponse,
    GetOwnersForContractResponse,
    NftContractNftsResponse,
    GetFloorPriceResponse,
    AssetTransfersResponse,
    TokenBalancesResponse
} from 'alchemy-sdk';

import { Log } from '@ethersproject/abstract-provider';
import {
    GetPlaformLogsByAddressRequestDTO,
    GetLogsBodyRequestDTO,
    BestUsersRequestDto,
    GetAssetTransfersRequestDTO,
    GetTokenPurchaseLogsRequestDTO
} from '@analytic/dto/request.dto';

@Controller({
    version: '1',
    path: 'analytic'
})
@ApiTags('Analytic')
export class AnalyticController {
    public constructor(private readonly analyticService: AnalyticService) {}

    @Get('brand/nft/transaction')
    @AuthJwtGuard()
    @ApiResponse({
        type: [AnalyticEntity],
        description:
            "Retrieve all events 'Transfered' for all nfts (minted / transfer / burn) linked to an user account"
    })

    /** GOLANG ROUTES */
    public async getNftsTransactionsByBrand(
        @GetUser('_id') user: string
    ): Promise<AnalyticDocument[]> {
        return this.analyticService.getNftsTransactionsByBrand(user);
    }

    @Get('collection/nft/transaction/:collection')
    @AuthJwtGuard()
    @ApiResponse({
        type: [AnalyticEntity],
        description:
            "Retrieve all events 'Transfered' for all nfts (minted / transfer / burn) linked to a collection contract"
    })
    public async getNftsTransactionsByContract(
        @Param('collection') collection: string
    ): Promise<AnalyticDocument[]> {
        return this.analyticService.getNftsTransactionsByContract(collection);
    }

    @Get('brand/nft/top-owner')
    @AuthJwtGuard()
    @ApiResponse({
        description:
            "Retrieve top user address of nft's quantities owned on all contract of a brand"
    })
    public async getTopsNftsOwner(
        @GetUser('_id') user: string
    ): Promise<Record<string, number>> {
        return this.analyticService.getTopsNftsOwner(user);
    }

    @Get('collection/nft/top-owner/:collection')
    @AuthJwtGuard()
    @ApiResponse({
        description:
            "Retrieve top user address of nft's quantities owned on one contract of a brand"
    })
    public async getTopsNftsOwnerByCollection(
        @GetUser('_id') user: string,
        @Param('collection') collection: string
    ): Promise<Record<string, number>> {
        return this.analyticService.getTopsNftsOwnerByCollection(
            user,
            collection
        );
    }

    @Get('brand/nft/top-collectors')
    @AuthJwtGuard()
    @ApiResponse({
        description:
            "Retrieve top user address of nft's claimed revenues on all contract of a brand"
    })
    public async getTopsCollectors(
        @GetUser('_id') user: string
    ): Promise<Record<string, number>> {
        return this.analyticService.getTopsCollectors(user);
    }

    @Get('collection/nft/top-collectors/:collection')
    @AuthJwtGuard()
    @ApiResponse({
        description:
            "Retrieve top user address of nft's claimed revenues on one contract of a brand"
    })
    public async getTopsCollectorsByCollection(
        @GetUser('_id') user: string,
        @Param('collection') collection: string
    ): Promise<Record<string, number>> {
        return this.analyticService.getTopsCollectorsByCollection(
            user,
            collection
        );
    }

    @Get('auction/:collection/:listId/:tokenId')
    @AuthJwtGuard()
    @ApiResponse({
        type: [AnalyticEntity],
        description:
            'Retrieve end auction events from a list id and token id for know value, address buyer and time'
    })
    public async getAuction(
        @Param('collection') collection: string,
        @Param('listId') listId: string,
        @Param('tokenId') tokenId: string
    ): Promise<AnalyticDocument[]> {
        return this.analyticService.getAuction(collection, listId, tokenId);
    }

    @Get('buy/:collection/:listId/:tokenId')
    @AuthJwtGuard()
    @ApiResponse({
        type: [AnalyticEntity],
        description:
            'Retrieve sale events from a list id and token id for know value, address buyer and time'
    })
    public async getBuy(
        @Param('collection') collection: string,
        @Param('listId') listId: string,
        @Param('tokenId') tokenId: string
    ): Promise<AnalyticDocument[]> {
        return this.analyticService.getBuy(collection, listId, tokenId);
    }

    @Get('claim/:collection/:claimConditionId')
    @AuthJwtGuard()
    @ApiResponse({
        type: [AnalyticEntity],
        description:
            'Retrieve claim events from a claim condition id for know value, address buyer and time'
    })
    public async getClaim(
        @Param('collection') collection: string,
        @Param('claimConditionId') claimConditionId: string
    ): Promise<AnalyticDocument[]> {
        return this.analyticService.getClaim(collection, claimConditionId);
    }

    @Get('sales/:collection')
    @AuthJwtGuard()
    @ApiResponse({
        type: [AnalyticEntity],
        description:
            'Retrieve end auction, sales, claimed events from a collection id for know value, address buyer and time'
    })
    public async getRevenueSalesOfContract(
        @Param('collection') collection: string
    ): Promise<AnalyticDocument[]> {
        return this.analyticService.getRevenueSalesOfContract(collection);
    }

    @Get('sales/group-by-date-and-type/:collection')
    @AuthJwtGuard()
    @ApiResponse({
        type: salesByDatesEntity,
        description:
            'Retrieve end auction, sales, claimed events from a collection id for know value, address buyer and time in a record with key is a date'
    })
    public async getRevenueSalesOfContractSortByDate(
        @Param('collection') collection: string
    ): Promise<Record<string, Record<string, AnalyticDocument[]>>> {
        return this.analyticService.getRevenueSalesOfContractSortByDate(
            collection
        );
    }

    @Get('balance/address-wallet/:addressWallet/:contractNetwork')
    @AuthJwtGuard()
    @ApiResponse({
        type: ethers.BigNumber,
        description: "Retrieve balance's native token from an address wallet"
    })
    public async getNativeTokenBalanceOfUser(
        @Param('addressWallet') addressWallet: string,
        @Param('contractNetwork') contractNetwork: string
    ): Promise<ethers.BigNumber> {
        return this.analyticService.getNativeTokenBalanceOfUser(
            addressWallet,
            contractNetwork
        );
    }

    /** ALCHEMY ROUTES */

    @Get('nfts/owner/:owner')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve nfts owned by one wallet address'
    })
    public async getNftsForOwner(
        @Param('owner') owner: string
    ): Promise<OwnedNftsResponse> {
        return this.analyticService.getNftsForOwner(owner);
    }

    @Get('nfts/contract/:contract')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve nfts owned by one contract'
    })
    public async getNftsForContract(
        @Param('contract') contract: string
    ): Promise<NftContractNftsResponse> {
        return this.analyticService.getNftsForContract(contract);
    }

    @Get('owners/contract/:contract')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve owners nfts by one contract'
    })
    public async getOwnersForContract(
        @Param('contract') contract: string
    ): Promise<GetOwnersForContractResponse> {
        return this.analyticService.getOwnersForContract(contract);
    }

    @Get('owners/contracts')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve owners nfts by multiple contract'
    })
    public async getOwnersForContracts(
        @Body() body
    ): Promise<Record<string, GetOwnersForContractResponse>> {
        return this.analyticService.getOwnersForContracts(body.contracts);
    }

    @Get('logs/token')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description:
            'Retrieve logs nfts transfer / mint / burn for one contract address by date month or days'
    })
    public async getLogsToken(
        @Body()
        { address, fromDate, toDate, typeDate }
    ): Promise<ethers.providers.Log[]> {
        return this.analyticService.getLogsToken(
            address,
            fromDate,
            toDate,
            typeDate
        );
    }

    @Get('token/purchase/logs')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description:
            'Get all logs transfered tokens with value to an user in past month by default or in array range date'
    })
    public async getTokenPurchaseLogs(
        @Body()
        { addressUser, fromDate, toDate }: GetTokenPurchaseLogsRequestDTO
    ): Promise<Record<string, string | number>[]> {
        return this.analyticService.getTokenPurchaseLogs(
            addressUser,
            fromDate,
            toDate
        );
    }

    @Get('token/sell/logs')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description:
            'Get all logs transfered tokens with value to an user in past month or in array range date'
    })
    public async getTokenSellLogs(
        @Body()
        { addressUser, fromDate, toDate }: GetTokenPurchaseLogsRequestDTO
    ): Promise<Record<string, string | number>[]> {
        return this.analyticService.getTokenSellLogs(
            addressUser,
            fromDate,
            toDate
        );
    }

    @Get('count/logs/token')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description:
            'Retrieve logs count nfts transfer / mint / burn for one contract address by date month or days'
    })
    public async getCountLogsToken(
        @Body()
        { address, fromDate, toDate, typeDate }
    ): Promise<number> {
        return (
            await this.analyticService.getLogsToken(
                address,
                fromDate,
                toDate,
                typeDate
            )
        ).length;
    }

    @Get('floor-price/:contract')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve floor price by one contract'
    })
    public async getFloorPrice(
        @Param('contract') contract: string
    ): Promise<GetFloorPriceResponse> {
        return this.analyticService.getFloorPrice(contract);
    }

    @Get('balance/token/:owner')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve balance token by one user'
    })
    public async getTokenBalances(
        @Param('owner') owner: string
    ): Promise<TokenBalancesResponse> {
        return this.analyticService.getTokenBalances(owner);
    }

    @Get('asset/transfers')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve and filter transfer events'
    })
    public async getAssetTransfers(
        @Body()
        {
            contractAddresses,
            category,
            withMetadata,
            excludeZeroValue,
            order,
            fromAddress,
            toAddress
        }: GetAssetTransfersRequestDTO
    ): Promise<AssetTransfersResponse> {
        return this.analyticService.getAssetTransfers(
            contractAddresses,
            category,
            withMetadata,
            excludeZeroValue,
            order,
            fromAddress,
            toAddress
        );
    }

    @Get('logs')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description: 'Retrieve and filter logs events'
    })
    public async getLogs(
        @Body()
        { address, fromBlock, toBlock, topics }: GetLogsBodyRequestDTO
    ): Promise<Log[]> {
        return this.analyticService.getLogs(
            address,
            fromBlock,
            toBlock,
            topics
        );
    }

    @Get('platforms/logs')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description:
            'Retrieve sales logs events of platform opensea / looksRare / rarible / x2y2 with transfer logs attached'
    })
    public async getPlaformLogsByAddress(
        @Body()
        { withMetadata, order, addressUser }: GetPlaformLogsByAddressRequestDTO
    ): Promise<
        Record<string, number | Array<Record<string, number | string>>>
    > {
        return this.analyticService.getPlaformLogsByAddress(
            withMetadata,
            order,
            addressUser
        );
    }

    @Get('collectors')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description:
            'Retrieve logs buy / end-auction / token claimed for one or multiple contract by date and sort by quantity'
    })
    public async collectors(
        @Body()
        { addresses, fromDate, toDate, typeDate, topics }: BestUsersRequestDto
    ): Promise<Record<string, string | number | Array<Record<string, any>>>> {
        return await this.analyticService.collectors(
            addresses,
            fromDate,
            toDate,
            typeDate,
            topics
        );
    }

    // Great endpoint name
    @Get('buyers')
    //@AuthJwtGuard()
    @ApiResponse({
        type: Object,
        description:
            'Retrieve logs buy / end-auction / token claimed for one or multiple contract by date and sort by value'
    })
    public async buyers(
        @Body()
        { addresses, fromDate, toDate, typeDate, topics }: BestUsersRequestDto
    ): Promise<Record<string, string | number | Array<Record<string, any>>>> {
        return await this.analyticService.buyers(
            addresses,
            fromDate,
            toDate,
            typeDate,
            topics
        );
    }
}
