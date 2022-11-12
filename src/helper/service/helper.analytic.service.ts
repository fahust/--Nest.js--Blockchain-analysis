import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyticDocument } from '@analytic/schema/analytic.schema';
import { ethers } from 'ethers';
import { LoggerService } from '@logger/service/logger.service';

import {
    PlatformSalesTopic,
    TransferEventTopic,
    InternalTopicTransaction,
    EventsLogsABI
} from '@shared';

import EthDater from 'ethereum-block-by-date';

import type {
    Log,
    TransactionResponse
} from '@ethersproject/abstract-provider';

import { Network, Alchemy } from 'alchemy-sdk';

@Injectable()
export class HelperAnalyticService {
    private readonly infuraProjectId: string;
    private readonly infuraProjectSecret: string;
    private readonly loggerService: LoggerService;
    private readonly alchemyApiKey: string;
    private readonly alchemy: Alchemy;

    constructor(private readonly configService: ConfigService) {
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
     * Sort claimer address from an object array, on the value, upper to lower
     * @param {string} claimerAddress
     * @returns {Record<string, number>}
     */
    sortClaimerAddress(
        claimerAddress: Record<string, number>
    ): Record<string, number> {
        return Object.entries(claimerAddress)
            .sort(([, a], [, b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    }

    /**
     * Sort collectors address from an object array, on the value, upper to lower
     * @param {string} claimerAddress
     * @returns {Record<string, number>}
     */
    sortCollectors(
        collectors: Record<string, string | number>,
        param: string
    ): Record<string, number> {
        return Object.entries(collectors)
            .sort(([, a], [, b]) => b[param] - a[param])
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    }

    /**
     *
     * @param {AnalyticDocument[]} analytics
     * @returns {Record<string, number>}
     */
    filterTopOwnerByQuantity(
        analytics: AnalyticDocument[]
    ): Record<string, number> {
        const claimerAddress: Record<string, number> = {};
        analytics.forEach(analytic => {
            if (analytic.name === 'TokensClaimed') {
                if (!claimerAddress[analytic.data['claimer']])
                    claimerAddress[analytic.data['claimer']] = 0;
                claimerAddress[analytic.data['claimer']] += parseInt(
                    analytic.data['quantityClaimed']
                );
            } else if (analytic.name === 'Buy') {
                if (!claimerAddress[analytic.data['addressBuyer']])
                    claimerAddress[analytic.data['addressBuyer']] = 0;
                claimerAddress[analytic.data['addressBuyer']] += parseInt(
                    analytic.data['quantity']
                );
            } else if (analytic.name === 'EndAuction') {
                if (!claimerAddress[analytic.data['lastBidder']])
                    claimerAddress[analytic.data['lastBidder']] = 0;
                claimerAddress[analytic.data['lastBidder']] += parseInt(
                    analytic.data['quantity']
                );
            }
        });
        return this.sortClaimerAddress(claimerAddress);
    }

    /**
     *
     * @param {AnalyticDocument[]} analytics
     * @returns {Record<string, number>}
     */
    filterTopOwnerByValue(
        analytics: AnalyticDocument[]
    ): Record<string, number> {
        const claimerAddress: Record<string, number> = {};
        analytics.forEach(analytic => {
            if (analytic.name == 'TokensClaimed') {
                if (!claimerAddress[analytic.data['claimer']])
                    claimerAddress[analytic.data['claimer']] = 0;
                claimerAddress[analytic.data['claimer']] += parseInt(
                    analytic.value
                );
            } else if (analytic.name == 'Buy') {
                if (!claimerAddress[analytic.data['addressBuyer']])
                    claimerAddress[analytic.data['addressBuyer']] = 0;
                claimerAddress[analytic.data['addressBuyer']] += parseInt(
                    analytic.data['value']
                );
            } else if (analytic.name == 'EndAuction') {
                if (!claimerAddress[analytic.data['lastBidder']])
                    claimerAddress[analytic.data['lastBidder']] = 0;
                claimerAddress[analytic.data['lastBidder']] += parseInt(
                    analytic.data['lastBid']
                );
            }
        });
        return this.sortClaimerAddress(claimerAddress);
    }

    /**
     *
     * @param {string} contractNetwork string chain of network (ex:goerli)
     * @returns {Promise<ethers.providers.InfuraProvider>}
     */
    async provided(
        contractNetwork: string
    ): Promise<ethers.providers.InfuraProvider> {
        const provider = new ethers.providers.InfuraProvider(contractNetwork, {
            projectId: this.infuraProjectId,
            projectSecret: this.infuraProjectSecret
        });
        return provider;
    }

    async thowErrorCollectionNotFound(collection: string) {
        this.loggerService.error(
            `No contract found for id ${collection}`,
            'AuthenticationService',
            'challengeUser'
        );

        throw new NotFoundException({
            statusCode: 404,
            message: 'analytics.collection.error.collectionNotFound'
        });
    }

    async thowErrorUserNotFound(user: string) {
        this.loggerService.error(
            `No user found for user id ${user}`,
            'AuthenticationService',
            'challengeUser'
        );

        throw new NotFoundException({
            statusCode: '404',
            message: 'analytics.user.error.userNotFound'
        });
    }

    /**
     * Return a name of platform by topic[0] from log
     * @param {string} topic topic[0] from log
     * @returns {string}
     */
    platformName(topic: string) {
        if (topic === PlatformSalesTopic.LOOKSRARE) return 'looksrare';
        if (topic === PlatformSalesTopic.RARIBLE) return 'rarible';
        if (topic === PlatformSalesTopic.SEAPORT) return 'seaport';
        if (topic === PlatformSalesTopic.X2Y2) return 'x2y2';
    }

    /**
     * Decode an address from a big number string
     * @param {string} address addresse in hash format
     * @returns {string} address in hex format
     */
    decodeAddress(address: string) {
        return ethers.BigNumber.from(address)._hex;
    }

    /**
     * Decode a number from big number string
     * @param {string} value number in hash format
     * @returns {number} number in hex format
     */
    decodeInt(value: string): number {
        return parseInt(ethers.BigNumber.from(value).toString());
    }

    /**
     * Encode an hash from an hexadecimal address
     * @param {string} address address in hex format
     * @returns {string} address in hash format
     */
    encodeAddress(address: string): string {
        return ethers.utils.defaultAbiCoder.encode(['address'], [address]);
    }

    /**
     * Parse Log by data and topics for event kanji smart contract
     * @param {Log} vlog Log you want to decrypt data
     * @returns {Promise<ethers.utils.LogDescription|ethers.providers.Log>} Parsed log with interface abi
     */
    async decryptDataInternal(vlog: Log) {
        try {
            const abi = [
                EventsLogsABI.ENDAUCTION,
                EventsLogsABI.BUY,
                EventsLogsABI.TOKENSCLAIMED,
                EventsLogsABI.TOKENSCLAIMED1155,
                EventsLogsABI.TOKENSCLAIMEDPHOENIX
            ];

            const iface = new ethers.utils.Interface(abi).parseLog({
                topics: vlog.topics,
                data: vlog.data
            });

            if (vlog.topics[0] == InternalTopicTransaction.CLAIM) {
                return {
                    name: 'Claim token DROPERC721',
                    receiver: this.decodeAddress(vlog.topics[3]),
                    startTokenId: parseInt(iface[0]),
                    quantity: parseInt(iface[1]),
                    value: parseInt(iface[1]) * parseInt(iface[2]),
                    pricePerToken: parseInt(iface[2]),
                    txHash: vlog.transactionHash,
                    blockNumber: vlog.blockNumber
                };
            }
            if (vlog.topics[0] == InternalTopicTransaction.CLAIM1155) {
                return {
                    name: 'Claim token DROPERC1155',
                    receiver: this.decodeAddress(vlog.topics[3]),
                    startTokenId: parseInt(iface[1]),
                    quantity: parseInt(iface[2]),
                    value: parseInt(iface[2]) * parseInt(iface[3]),
                    pricePerToken: parseInt(iface[3]),
                    txHash: vlog.transactionHash,
                    blockNumber: vlog.blockNumber
                };
            }
            if (vlog.topics[0] == InternalTopicTransaction.CLAIMPHOENIX) {
                return {
                    name: 'Claim token DROPPHOENIX',
                    receiver: this.decodeAddress(vlog.topics[2]),
                    startTokenId: this.decodeInt(vlog.topics[1]),
                    quantity: parseInt(iface[0]),
                    value: parseInt(iface[0]) * parseInt(iface[1]),
                    pricePerToken: parseInt(iface[1]),
                    txHash: vlog.transactionHash,
                    blockNumber: vlog.blockNumber
                };
            }
            if (vlog.topics[0] == InternalTopicTransaction.ENDAUCTION) {
                return {
                    name: 'End Auction marketplace',
                    receiver: this.decodeAddress(vlog.topics[3]),
                    startTokenId: parseInt(iface[1]),
                    quantity: parseInt(iface[3]),
                    value: parseInt(iface[3]) * parseInt(iface[4]),
                    pricePerToken: parseInt(iface[4]),
                    txHash: vlog.transactionHash,
                    blockNumber: vlog.blockNumber
                };
            }
            if (vlog.topics[0] == InternalTopicTransaction.BUY) {
                return {
                    name: 'Buy marketplace',
                    receiver: this.decodeAddress(vlog.topics[1]),
                    startTokenId: this.decodeInt(vlog.topics[3]),
                    quantity: parseInt(iface[1]),
                    value: parseInt(iface[1]) * parseInt(iface[0]),
                    pricePerToken: parseInt(iface[0]),
                    txHash: vlog.transactionHash,
                    blockNumber: vlog.blockNumber
                };
            }
        } catch (error) {
            return vlog;
        }
    }

    /**
     * Parse Log by data and topics for event kanji smart contract
     * @param {Log} vlog Log you want to decrypt data
     * @returns {Promise<ethers.utils.LogDescription|ethers.providers.Log>} Parsed log with interface abi
     */
    async decryptDataExternal(vlog: Log) {
        try {
            const abi = [
                EventsLogsABI.TRANSFERERC721,
                EventsLogsABI.TRANSFERSINGLE
            ];

            const iface = new ethers.utils.Interface(abi).parseLog({
                topics: vlog.topics,
                data: vlog.data
            });

            if (vlog.topics[0] == TransferEventTopic.ERC1155) {
                return {
                    name: 'Transfer token ERC1155',
                    from: this.decodeAddress(vlog.topics[2]),
                    to: this.decodeAddress(vlog.topics[3]),
                    txHash: vlog.transactionHash,
                    type: 'ERC1155',
                    blockNumber: vlog.blockNumber
                };
            }
            if (vlog.topics[0] == TransferEventTopic.ERC721) {
                return {
                    name: 'Transfer token ERC721',
                    from: this.decodeAddress(vlog.topics[1]),
                    to: this.decodeAddress(vlog.topics[2]),
                    tokenId: this.decodeInt(vlog.topics[3]),
                    txHash: vlog.transactionHash,
                    type: 'ERC721',
                    blockNumber: vlog.blockNumber
                };
            }
        } catch (error) {
            return vlog;
        }
    }

    /**
     * Return a block by date in days, month, years, ect
     * @param {string|Date} date Date where you want to find block
     * @param {string} typeDate Period, required. Valid value: years, quarters, months, weeks, days, hours, minutes
     * @returns {Promise<number|undefined>} Block number match with date
     */
    async blockByDate(
        date: string | Date,
        typeDate: string
    ): Promise<number | undefined> {
        try {
            const dater = new EthDater(
                new ethers.providers.InfuraProvider('homestead', {
                    projectId: this.infuraProjectId,
                    projectSecret: this.infuraProjectSecret
                })
            );
            return (
                await dater.getEvery(
                    typeDate, // Period, required. Valid value: years, quarters, months, weeks, days, hours, minutes
                    date, //'2017-09-02T12:00:00Z', // Start date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
                    date, // End date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
                    1, // Duration, optional, integer. By default 1.
                    true, // Block after, optional. Search for the nearest block before or after the given date. By default true.
                    false // Refresh boundaries, optional. Recheck the latest block before request. By default false.
                )
            )[0].block;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Return block range by date
     * If fromDate & toDate is undefined return last month range block
     * @param {string|Date|undefined} fromDate Start date for range
     * @param {string|Date|undefined} toDate End date for range
     * @returns {Promise<Record<string, number>>} {FromBlock, ToBlock}
     */
    async lastMonthBlock(
        fromDate: string | Date | undefined,
        toDate: string | Date | undefined
    ): Promise<Record<string, number>> {
        if (!fromDate && !toDate) {
            fromDate = new Date();
            toDate = new Date();
            fromDate.setDate(fromDate.getDate() - 31);
        }
        return {
            fromBlock: await this.blockByDate(fromDate, 'days'),
            toBlock: await this.blockByDate(toDate, 'days')
        };
    }

    /**
     * Return object formated of token data ERC20/ERC1155
     * @param {Log} vlog
     * @param {TransactionResponse} tx
     * @returns {Promise<Record<string, number|string>>}
     */
    async formatToken(
        vlog: Log,
        tx: TransactionResponse
    ): Promise<Record<string, number | string>> {
        const { timestamp } = await this.alchemy.core.getBlock(tx.blockHash);
        if (vlog.topics[0] == TransferEventTopic.ERC1155) {
            return {
                from: this.decodeAddress(vlog.topics[2]),
                to: this.decodeAddress(vlog.topics[3]),
                value: parseInt(tx.value.toString()),
                txHash: tx.hash,
                type: 'ERC1155',
                time: timestamp,
                blockNumber: tx.blockNumber
            };
        }
        if (vlog.topics[0] == TransferEventTopic.ERC721) {
            return {
                from: this.decodeAddress(vlog.topics[1]),
                to: this.decodeAddress(vlog.topics[2]),
                tokenId: this.decodeInt(vlog.topics[3]),
                value: parseInt(tx.value.toString()),
                txHash: tx.hash,
                type: 'ERC721',
                time: timestamp,
                blockNumber: tx.blockNumber
            };
        }
    }
}
