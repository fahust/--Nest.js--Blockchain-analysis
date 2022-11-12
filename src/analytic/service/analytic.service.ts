import {
    AnalyticDocument,
    AnalyticEntity
} from '@analytic/schema/analytic.schema';
import { CollectionService } from '@collection/service/collection.service';
import { DatabaseEntity } from '@database/decorator/database.decorator';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as mongoose from 'mongoose';
import { HelperAnalyticService } from '@helper/service/helper.analytic.service';
import {
    Network,
    Alchemy,
    OwnedNftsResponse,
    GetOwnersForContractResponse,
    NftContractNftsResponse,
    GetFloorPriceResponse,
    AssetTransfersCategory,
    AssetTransfersOrder,
    AssetTransfersResponse,
    TokenBalancesResponse
} from 'alchemy-sdk';

import {
    PlatformSalesTopic,
    BlockHash
} from '@shared/enums';
import {
    TransferEventTopic,
} from '@shared/interfaces';

import type { Log } from '@ethersproject/abstract-provider';

import { ConfigService } from '@nestjs/config/dist';
@Injectable()
export class AnalyticService {
    private readonly alchemyApiKey: string;
    private readonly infuraProjectId: string;
    private readonly infuraProjectSecret: string;
    private readonly alchemy: Alchemy;

    public constructor(
        @DatabaseEntity(AnalyticEntity.name)
        private readonly analyticModel: mongoose.Model<AnalyticDocument>,
        private readonly collectionService: CollectionService,
        private readonly helperAnalyticService: HelperAnalyticService,
        private readonly configService: ConfigService
    ) {
        this.infuraProjectId = this.configService.get<string>(
            'token.infura.projectId'
        );
        this.infuraProjectSecret = this.configService.get<string>(
            'token.infura.projectSecret'
        );

        this.alchemyApiKey = this.configService.get<string>(
            'analytic.alchemy.apiKey'
        );

        this.alchemy = new Alchemy({
            apiKey: this.alchemyApiKey,
            network: Network.ETH_MAINNET
        });
    }

    /**
     * Retrieve all events "Transfered" for all nfts (minted / transfer / burn) linked to an user account
     * @param {string} user  mongoId of user connected
     * @returns {Promise<AnalyticDocument[]>} array of analytics document
     */
    async getNftsTransactionsByBrand(
        user: string
    ): Promise<AnalyticDocument[]> {
        return this.analyticModel.find({
            user,
            name: 'Transfered'
        });
    }

    /**
     * Retrieve all events "Transfered" for all nfts (minted / transfer / burn) linked to a collection contract
     * @param {string} collection mongoId of collection with them interact
     * @returns {Promise<AnalyticDocument[]>} array of analytics document
     */
    async getNftsTransactionsByContract(
        collection: string
    ): Promise<AnalyticDocument[]> {
        const currentCollection = await this.collectionService.findOne({
            _id: collection
        });
        if (!currentCollection)
            this.helperAnalyticService.thowErrorCollectionNotFound(collection);
        return this.analyticModel.find({
            addressContract: currentCollection.contract.contractAddress,
            name: 'Transfered'
        });
    }

    /**
     * Retrieve top user address of nft's quantities owned on all contract of a brand
     * @param {string} user mongoId of user connected
     * @returns {Promise<Record<string, number>>}
     */
    async getTopsNftsOwner(user: string): Promise<Record<string, number>> {
        const analytic = await this.getSalesAndAuctionMongo(user);
        return this.helperAnalyticService.sortClaimerAddress(
            this.helperAnalyticService.filterTopOwnerByQuantity(analytic)
        );
    }

    /**
     * Retrieve top user address of nft's claimed revenues on all contract of a brand
     * @param {string} user mongoId of user connected
     * @returns {Promise<Record<string, number>>}
     */
    async getTopsCollectors(user: string): Promise<Record<string, number>> {
        const analytics = await this.getSalesAndAuctionMongo(user);
        return this.helperAnalyticService.sortClaimerAddress(
            this.helperAnalyticService.filterTopOwnerByValue(analytics)
        );
    }

    /**
     * Retrieve top user address of nft's quantities owned on one contract of a brand
     * @param {string} user mongoId of user connected
     * @param {string} collection mongoId of collection with them interact
     * @returns {Promise<Record<string, number>>}
     */
    async getTopsNftsOwnerByCollection(
        user: string,
        collection: string
    ): Promise<Record<string, number>> {
        const analytic = await this.getSalesAndAuctionMongo(user, collection);
        return this.helperAnalyticService.sortClaimerAddress(
            this.helperAnalyticService.filterTopOwnerByQuantity(analytic)
        );
    }

    /**
     * Retrieve top user address of nft's claimed revenues on one contract of a brand
     * @param {string} user mongoId of user connected
     * @param {string} collection mongoId of collection with them interact
     * @returns {Promise<Record<string, number>>}
     */
    async getTopsCollectorsByCollection(
        user: string,
        collection: string
    ): Promise<Record<string, number>> {
        const analytics = await this.getSalesAndAuctionMongo(user, collection);
        return this.helperAnalyticService.sortClaimerAddress(
            this.helperAnalyticService.filterTopOwnerByValue(analytics)
        );
    }

    /**
     * Retrieve end auction events from a list id and token id for know value, address buyer and time
     * @param {string} collection mongoId of collection with them interact
     * @param {string} listId id number index of list you want to listen
     * @param {string} tokenId token id of list you want to listen
     * @returns {Promise<AnalyticDocument[]>}
     */
    async getAuction(
        collection: string,
        listId: string,
        tokenId: string
    ): Promise<AnalyticDocument[]> {
        const currentCollection = await this.collectionService.findOne({
            _id: collection
        });
        if (!currentCollection)
            this.helperAnalyticService.thowErrorCollectionNotFound(collection);
        return this.analyticModel.find({
            addressContract: currentCollection.contract.contractAddress,
            name: 'EndAuction',
            'data._listingId': listId,
            'data.tokenId': tokenId
        });
    }

    /**
     * Retrieve sale events from a list id and token id for know value, address buyer and time
     * @param {string} collection mongoId of collection with them interact
     * @param {string} listId id number index of list you want to listen
     * @param {string} tokenId token id of list you want to listen
     * @returns {Promise<AnalyticDocument[]>}
     */
    async getBuy(
        collection: string,
        listId: string,
        tokenId: string
    ): Promise<AnalyticDocument[]> {
        const currentCollection = await this.collectionService.findOne({
            _id: collection
        });
        if (!currentCollection)
            this.helperAnalyticService.thowErrorCollectionNotFound(collection);
        return this.analyticModel.find({
            addressContract: currentCollection.contract.contractAddress,
            name: 'Buy',
            'data.listingId': listId,
            'data.tokenId': tokenId
        });
    }

    /**
     * Retrieve claim events from a claim condition id for know value, address buyer and time
     * @param {string} collection mongoId of collection with them interact
     * @param {string} claimConditionId id number index of claim condition you want to listen
     * @returns {Promise<AnalyticDocument[]>}
     */
    async getClaim(
        collection: string,
        claimConditionId: string
    ): Promise<AnalyticDocument[]> {
        const currentCollection = await this.collectionService.findOne({
            _id: collection
        });
        if (!currentCollection)
            this.helperAnalyticService.thowErrorCollectionNotFound(collection);
        return this.analyticModel.find({
            addressContract: currentCollection.contract.contractAddress,
            name: 'TokensClaimed',
            'data.claimConditionIndex': claimConditionId
        });
    }

    /**
     * Retrieve end auction, sales, claimed events from a collection id for know value, address buyer and time
     * @param {string} collection mongoId of collection with them interact
     * @returns {Promise<AnalyticDocument[]>}
     */
    async getRevenueSalesOfContract(
        collection: string
    ): Promise<AnalyticDocument[]> {
        return this.getSalesAndAuctionMongo(null, collection);
    }

    /**
     * Retrieve end auction, sales, claimed events from a collection id for know value, address buyer and time in a record with key is a date
     * @param {string} collection mongoId of collection with them interact
     * @returns {Promise<Record<string,Record<string, AnalyticDocument[]>>>}
     *  exemples :
        salesByDates = {
            "claim" : {
                "22/02/2022" : {
                    documentMongo,
                    documentMongo,
                },
                "23/02/2022" : {
                    documentMongo,
                },
            },
            "buy":{...},
            "endAuction":{...},
     */
    async getRevenueSalesOfContractSortByDate(
        collection: string
    ): Promise<Record<string, Record<string, AnalyticDocument[]>>> {
        const sales = await this.getSalesAndAuctionMongo(null, collection);
        const salesByDates: Record<
            string,
            Record<string, AnalyticDocument[]>
        > = {
            claim: {},
            buy: {},
            auction: {}
        };

        sales.forEach(sale => {
            if (sale.name === 'TokensClaimed') {
                if (!salesByDates['claim'][sale.createdAt])
                    salesByDates['claim'][sale.createdAt] = [];
                salesByDates['claim'][sale.createdAt].push(sale);
            } else if (sale.name === 'Buy') {
                if (!salesByDates['buy'][sale.createdAt])
                    salesByDates['buy'][sale.createdAt] = [];
                salesByDates['buy'][sale.createdAt].push(sale);
            } else if (sale.name === 'EndAuction') {
                if (!salesByDates['auction'][sale.createdAt])
                    salesByDates['auction'][sale.createdAt] = [];
                salesByDates['auction'][sale.createdAt].push(sale);
            }
        });
        return salesByDates;
    }

    /**
     * Retrieve balance's native token from an address wallet
     * @param {string} addressWallet string address wallet of user
     * @param {string} contractNetwork string chain of network (ex:goerli)
     * @returns {Promise<ethers.BigNumber>}
     */
    async getNativeTokenBalanceOfUser(
        addressWallet: string,
        contractNetwork: string
    ): Promise<ethers.BigNumber> {
        const provider = await this.helperAnalyticService.provided(
            contractNetwork
        );
        return provider.getBalance(addressWallet);
    }

    /*async getHistoryOfUser(user: string, blockchain: string): Promise<Record<string, number>> {
        const analytic = await this.analytic.find({
            user: user,
            $or: [
                { name: 'TokensClaimed' },
                { name: 'Buy' },
                { name: 'EndAuction' }
            ]
        });
        const provider = await this.provided(blockchain);
        return provider.getHistory(address);
    }*/

    /**
     *
     * @param {string|null} user mongoId of user connected
     * @param {string} collection mongoId of collection with them interact
     * @returns {Promise<AnalyticDocument[]>}
     */
    async getSalesAndAuctionMongo(
        user: string | null,
        collection = null
    ): Promise<AnalyticDocument[]> {
        if (collection && user) {
            const currentCollection = await this.collectionService.findOne({
                _id: collection
            });
            if (!currentCollection)
                this.helperAnalyticService.thowErrorCollectionNotFound(
                    collection
                );
            return this.analyticModel.find({
                addressContract: currentCollection.contract.contractAddress,
                user,
                $or: [
                    { name: 'TokensClaimed' },
                    { name: 'Buy' },
                    { name: 'EndAuction' }
                ]
            });
        } else if (collection && !user) {
            const currentCollection = await this.collectionService.findOne({
                _id: collection
            });
            if (!currentCollection)
                this.helperAnalyticService.thowErrorCollectionNotFound(
                    collection
                );
            return this.analyticModel.find({
                addressContract: currentCollection.contract.contractAddress,
                //user: user,
                $or: [
                    { name: 'TokensClaimed' },
                    { name: 'Buy' },
                    { name: 'EndAuction' }
                ]
            });
        } else if (!collection && user) {
            return this.analyticModel.find({
                user,
                $or: [
                    { name: 'TokensClaimed' },
                    { name: 'Buy' },
                    { name: 'EndAuction' }
                ]
            });
        }
    }

    //ALCHEMY

    /**
     * Return nfts owned by an address wallet
     * @param {string} owner
     * @returns {Promise<OwnedNftsResponse>}
     */
    async getNftsForOwner(owner: string): Promise<OwnedNftsResponse> {
        return this.alchemy.nft.getNftsForOwner(owner);
    }

    /**
     * Return nfts minted on contract by an address contract
     * @param {string} contract
     * @returns {Promise<NftContractNftsResponse>}
     */
    async getNftsForContract(
        contract: string
    ): Promise<NftContractNftsResponse> {
        return this.alchemy.nft.getNftsForContract(contract);
    }

    /**
     * Return owner's address of nfts owned from one contract
     * @param {string} contract
     * @returns {Promise<GetOwnersForContractResponse>}
     */
    async getOwnersForContract(
        contract: string
    ): Promise<GetOwnersForContractResponse> {
        return this.alchemy.nft.getOwnersForContract(contract);
    }

    /**
     * Return owner's address of nfts owned from multiple contracts
     * @param {Array<string>} contracts
     * @returns {Promise<Record<string,GetOwnersForContractResponse>>}
     */
    async getOwnersForContracts(
        contracts: Array<string>
    ): Promise<Record<string, GetOwnersForContractResponse>> {
        const ownerContracts = {};
        for (let index = 0; index < contracts.length; index++) {
            ownerContracts[contracts[index]] =
                await this.alchemy.nft.getOwnersForContract(contracts[index]);
        }
        return ownerContracts;
    }

    /**
     * Return logs tokens transfered (erc1155, erc721) for one addresse user by date block
     * @param {string} address
     * @param {string|Date} fromDate
     * @param {string|Date} toDate
     * @param {string} typeDate
     * @returns {Promise<Log[]>}
     */
    async getLogsToken(
        address: string,
        fromDate: string | Date,
        toDate: string | Date,
        typeDate: string
    ): Promise<Log[]> {
        const fromBlock = await this.helperAnalyticService.blockByDate(
            fromDate,
            typeDate
        );
        const toBlock = await this.helperAnalyticService.blockByDate(
            toDate,
            typeDate
        );

        return this.alchemy.core.getLogs({
            fromBlock: fromBlock ? fromBlock : BlockHash.FIRST,
            toBlock: toBlock ? toBlock : BlockHash.LAST,
            address,
            topics: [
                [
                    TransferEventTopic.ERC1155, //transfer single erc1155
                    TransferEventTopic.ERC721 //transfer erc20 //miss batch 1155
                ]
            ]
        });
    }

    /**
     * Return logs tokens transfered and buy in sales (erc1155, erc721) for one addresse user by date block or last month
     * @param {string} addressUser
     * @param {string|Date} fromDate
     * @param {string|Date} toDate
     * @returns {Promise<Array<Record<string,string|number>>>}
     */
    async getTokenPurchaseLogs(
        addressUser: string,
        fromDate: string | Date,
        toDate: string | Date
    ): Promise<Array<Record<string, string | number>>> {
        const tokens = [];
        const { fromBlock, toBlock } =
            await this.helperAnalyticService.lastMonthBlock(fromDate, toDate);
        const erc721 = await this.alchemy.core.getLogs({
            fromBlock: fromBlock ? fromBlock : BlockHash.FIRST,
            toBlock: toBlock ? toBlock : BlockHash.LAST,
            topics: [
                [TransferEventTopic.ERC721],
                [],
                [this.helperAnalyticService.encodeAddress(addressUser)]
            ]
        });

        const erc1155 = await this.alchemy.core.getLogs({
            fromBlock: fromBlock ? fromBlock : BlockHash.FIRST,
            toBlock: toBlock ? toBlock : BlockHash.LAST,
            topics: [
                [TransferEventTopic.ERC1155],
                [],
                [],
                [this.helperAnalyticService.encodeAddress(addressUser)]
            ]
        });

        for (let e7 = 0; e7 < erc721.length; e7++) {
            const tx = await this.alchemy.core.getTransaction(
                erc721[e7].transactionHash
            );
            if (
                !isNaN(parseInt(tx.value.toString())) &&
                parseInt(tx.value.toString()) > 0 &&
                erc721[e7].topics.length == 4
            ) {
                tokens.push(
                    await this.helperAnalyticService.formatToken(erc721[e7], tx)
                );
            }
        }

        for (let e11 = 0; e11 < erc1155.length; e11++) {
            const tx = await this.alchemy.core.getTransaction(
                erc1155[e11].transactionHash
            );
            if (
                !isNaN(parseInt(tx.value.toString())) &&
                parseInt(tx.value.toString()) > 0
            ) {
                tokens.push(
                    await this.helperAnalyticService.formatToken(
                        erc1155[e11],
                        tx
                    )
                );
            }
        }
        return tokens;
    }

    /**
     * Return logs tokens transfered and sell in sales (erc1155, erc721) for one addresse user by date block or last month
     * @param {string} addressUser
     * @param {string|Date} fromDate
     * @param {string|Date} toDate
     * @returns {Promise<Array<Record<string,string|number>>>}
     */
    async getTokenSellLogs(
        addressUser: string,
        fromDate: string | Date,
        toDate: string | Date
    ): Promise<Array<Record<string, string | number>>> {
        const tokens = [];
        const { fromBlock, toBlock } =
            await this.helperAnalyticService.lastMonthBlock(fromDate, toDate);
        const erc721 = await this.alchemy.core.getLogs({
            fromBlock: fromBlock ? fromBlock : BlockHash.FIRST,
            toBlock: toBlock ? toBlock : BlockHash.LAST,
            topics: [
                [TransferEventTopic.ERC721],
                [this.helperAnalyticService.encodeAddress(addressUser)]
            ]
        });

        const erc1155 = await this.alchemy.core.getLogs({
            fromBlock: fromBlock ? fromBlock : BlockHash.FIRST,
            toBlock: toBlock ? toBlock : BlockHash.LAST,
            topics: [
                [TransferEventTopic.ERC1155],
                [],
                [this.helperAnalyticService.encodeAddress(addressUser)]
            ]
        });

        for (let e7 = 0; e7 < erc721.length; e7++) {
            const tx = await this.alchemy.core.getTransaction(
                erc721[e7].transactionHash
            );
            if (
                !isNaN(parseInt(tx.value.toString())) &&
                parseInt(tx.value.toString()) > 0 &&
                erc721[e7].topics.length == 4
            ) {
                tokens.push(
                    await this.helperAnalyticService.formatToken(erc721[e7], tx)
                );
            }
        }

        for (let e11 = 0; e11 < erc1155.length; e11++) {
            const tx = await this.alchemy.core.getTransaction(
                erc1155[e11].transactionHash
            );
            if (
                !isNaN(parseInt(tx.value.toString())) &&
                parseInt(tx.value.toString()) > 0
            ) {
                tokens.push(
                    await this.helperAnalyticService.formatToken(
                        erc1155[e11],
                        tx
                    )
                );
            }
        }
        return tokens;
    }

    /**
     * Return floor price of collection on platform opensea / looksRare
     * @param {string} contract
     * @returns {Promise<GetFloorPriceResponse>}
     */
    async getFloorPrice(contract: string): Promise<GetFloorPriceResponse> {
        return this.alchemy.nft.getFloorPrice(contract);
    }

    /**
     * Return tokens balance of one address user wallet
     * @param {string} owner
     * @returns {Promise<TokenBalancesResponse>}
     */
    async getTokenBalances(owner: string): Promise<TokenBalancesResponse> {
        return this.alchemy.core.getTokenBalances(owner);
    }

    /**
     * Return transfer (alchemy data function) assets (nfts) with many parameter
     * @param {[string]} contractAddresses
     * @param {[AssetTransfersCategory]} category
     * @param {boolean} withMetadata
     * @param {boolean} excludeZeroValue
     * @param {AssetTransfersOrder} order
     * @param {string} fromAddress
     * @param {string} toAddress
     * @returns {Promise<AssetTransfersResponse>}
     */
    async getAssetTransfers(
        contractAddresses: Array<string>,
        category: [AssetTransfersCategory],
        withMetadata: boolean,
        excludeZeroValue: boolean,
        order = AssetTransfersOrder.ASCENDING,
        fromAddress: string,
        toAddress: string
    ): Promise<AssetTransfersResponse> {
        return this.alchemy.core.getAssetTransfers({
            fromBlock: BlockHash.FIRST,
            toBlock: BlockHash.LAST,
            contractAddresses,
            category,
            withMetadata,
            excludeZeroValue,
            order,
            fromAddress,
            toAddress
        });
    }

    /**
     * Return logs from range block with parameter topics and address contract emitter
     * @param {string} address
     * @param {string} fromBlock
     * @param {string} toBlock
     * @param {[string]} topics
     * @returns {Promise<Log[]>}
     */
    async getLogs(
        address: string,
        fromBlock: string,
        toBlock: string,
        topics: Array<string>
    ): Promise<Log[]> {
        try {
            return this.alchemy.core.getLogs({
                address,
                fromBlock,
                toBlock,
                topics
            });
        } catch (error) {
            return error;
        }
    }

    /**
     * Return sales events from platform (opensea, rarible, looksrare, x2y2)
     * @param {boolean} withMetadata
     * @param {AssetTransfersOrder} order
     * @param {string} addressUser
     * @returns {Promise<Record<string,number|Array<Record<string,number|string>>>>}
     */
    async getPlaformLogsByAddress(
        withMetadata: boolean,
        order = AssetTransfersOrder.ASCENDING,
        addressUser: string
    ): Promise<
        Record<string, number | Array<Record<string, number | string>>>
    > {
        try {
            const startTime = Date.now();
            const usersLogs = {
                seaport: [],
                rarible: [],
                x2y2: [],
                looksrare: [],
                time: 0
            };
            for (let t = 0; t < 2; t++) {
                //we start we search of all transfer token by this user with from address and to address
                const ercTransfer = await this.getAssetTransfersFromOrToUser(
                    withMetadata,
                    order,
                    addressUser,
                    t
                );
                //in this step we loop on all transfer's block, and search event of sales looksrare, x2y2, rarible, seaport
                for (let i = 0; i < ercTransfer.transfers.length; i++) {
                    const { timestamp } = await this.alchemy.core.getBlock(
                        ercTransfer.transfers[i].blockHash
                    );
                    const logsPlatforms = await this.alchemy.core.getLogs({
                        fromBlock: ercTransfer.transfers[i].blockNum,
                        toBlock: ercTransfer.transfers[i].blockNum,
                        topics: [
                            [
                                PlatformSalesTopic.LOOKSRARE,
                                PlatformSalesTopic.RARIBLE,
                                PlatformSalesTopic.SEAPORT,
                                PlatformSalesTopic.X2Y2
                            ]
                        ]
                    });
                    await this.addSalesEventByPlatform(
                        logsPlatforms,
                        timestamp,
                        ercTransfer,
                        i,
                        usersLogs
                    );
                }
            }
            usersLogs.time = Date.now() - startTime;
            return usersLogs;
        } catch (error) {
            return error;
        }
    }

    /**
     * Dispatch function "getPlaformLogsByAddress" used  to return transfer FROM user or TO user
     * @param {boolean} withMetadata
     * @param {boolean} order
     * @param {string} addressUser
     * @param {number} i
     * @returns {Promise<any>}
     */
    async getAssetTransfersFromOrToUser(
        withMetadata: boolean,
        order,
        addressUser: string,
        i: number
    ): Promise<any> {
        if (i === 1) {
            return this.alchemy.core.getAssetTransfers({
                fromBlock: BlockHash.FIRST,
                toBlock: BlockHash.LAST,
                category: [
                    AssetTransfersCategory.ERC1155,
                    AssetTransfersCategory.ERC20,
                    AssetTransfersCategory.ERC721
                ],
                withMetadata,
                order,
                fromAddress: addressUser
            });
        } else {
            return this.alchemy.core.getAssetTransfers({
                fromBlock: BlockHash.FIRST,
                toBlock: BlockHash.LAST,
                category: [
                    AssetTransfersCategory.ERC1155,
                    AssetTransfersCategory.ERC20,
                    AssetTransfersCategory.ERC721
                ],
                withMetadata,
                order,
                toAddress: addressUser
            });
        }
    }

    /**
     * Loop on logs platforms and search for each them if exists in attached tx, transfer logs erc1155/erc20/erc721
     * Then add and decode this logs in usersLogs variable
     * @param {Log[]} logsPlatforms
     * @param {number} timestamp
     * @param ercTransfer
     * @param {number} i
     * @param usersLogs
     */
    async addSalesEventByPlatform(
        logsPlatforms: Log[],
        timestamp: number,
        ercTransfer: any,
        i: number,
        usersLogs
    ) {
        for (let j = 0; j < logsPlatforms.length; j++) {
            const platformLog = {
                'sales event': logsPlatforms[j],
                timestamp,
                transfer: []
            };

            const logsInBlock = await this.alchemy.core.getLogs({
                fromBlock: ercTransfer.transfers[i].blockNum,
                toBlock: ercTransfer.transfers[i].blockNum,
                topics: [
                    [TransferEventTopic.ERC1155, TransferEventTopic.ERC721]
                ]
            });
            await this.logsInBlock(logsInBlock, logsPlatforms[j], platformLog);
            const platform = this.helperAnalyticService.platformName(
                logsPlatforms[j].topics[0]
            );
            if (platform) usersLogs[platform].push(platformLog);
        }
    }

    /**
     * Decode data from log transfer in function "getPlaformLogsByAddress"
     * @param {Log[]} logsInBlock
     * @param {Log} logsPlatform
     * @param {Record<string,Array<ethers.providers.Log | ethers.utils.LogDescription | number | any[]>>} platformLog
     */
    async logsInBlock(
        logsInBlock: Log[],
        logsPlatform: Log,
        platformLog: Record<
            string,
            ethers.providers.Log | ethers.utils.LogDescription | number | any[]
        >
    ) {
        for (let k = 0; k < logsInBlock.length; k++) {
            if (
                logsInBlock[k].transactionHash === logsPlatform.transactionHash
            ) {
                if (Array.isArray(platformLog.transfer)) {
                    platformLog.transfer.push(
                        await this.helperAnalyticService.decryptDataExternal(
                            logsInBlock[k]
                        )
                    );
                }
            }
        }
    }

    /**
     * Return best collectors nfts from one or multiple collection and sort them by quantity
     * @param {Array<string>} addresses
     * @param {string} fromDate
     * @param {string} toDate
     * @param {string} typeDate
     * @param {[string]} topics
     * @returns {Promise<Record<string, string | number>>}
     */
    async collectors(
        addresses: Array<string>,
        fromDate: string,
        toDate: string,
        typeDate: string,
        topics: [string]
    ): Promise<Record<string, string | number | Array<Record<string, any>>>> {
        const bestUsers = await this.users(
            addresses,
            fromDate,
            toDate,
            typeDate,
            topics
        );
        return this.helperAnalyticService.sortCollectors(bestUsers, 'quantity');
    }

    /**
     * Return best collectors nfts from one or multiple collection and sort them by values
     * @param {Array<string>} addresses
     * @param {string} fromDate
     * @param {string} toDate
     * @param {string} typeDate
     * @param {[string]} topics
     * @returns {Promise<Record<string, string | number>>}
     */
    async buyers(
        addresses: Array<string>,
        fromDate: string,
        toDate: string,
        typeDate: string,
        topics: [string]
    ): Promise<Record<string, string | number>> {
        const users = await this.users(
            addresses,
            fromDate,
            toDate,
            typeDate,
            topics
        );
        return this.helperAnalyticService.sortCollectors(users, 'value');
    }

    /**
     * Process on best users nfts from one or multiple collection
     * @param {[string]} addresses
     * @param {string} fromDate
     * @param {string} toDate
     * @param {string} typeDate
     * @param {[string]} topics
     * @returns {Promise<Record<string, string | number>>}
     */
    async users(
        addresses: Array<string>,
        fromDate: string,
        toDate: string,
        typeDate: string,
        topics: [string]
    ): Promise<Record<string, string | number>> {
        const collectors = {};
        const fromBlock = await this.helperAnalyticService.blockByDate(
            fromDate,
            typeDate
        );
        const toBlock = await this.helperAnalyticService.blockByDate(
            toDate,
            typeDate
        );
        for (let contract = 0; contract < addresses.length; contract++) {
            collectors[addresses[contract]] = [];
            const logs = await this.alchemy.core.getLogs({
                address: addresses[contract],
                fromBlock: fromBlock ? fromBlock : BlockHash.FIRST,
                toBlock: toBlock ? toBlock : BlockHash.LAST,
                topics: topics
            });

            for (let log = 0; log < logs.length; log++) {
                collectors[addresses[contract]].push({
                    log: logs[log],
                    decrypt: this.helperAnalyticService.decryptDataInternal(
                        logs[log]
                    )
                });
            }
        }
        return collectors;
    }
}
