export enum StorageEnum {
    IPFS = 'ipfs',
    S3 = 's3'
}

export enum NetworkNameEnum {
    Goerli = 'goerli',
    Mumbai = 'mumbai'
}

export enum NetworkChainEnum {
    Ethereum = 'ethereum',
    Polygon = 'polygon'
}

export enum NetworkTypeEnum {
    Mainnet = 'mainnet',
    Testnet = 'testnet'
}

export enum NetworkCurrencyEnum {
    EthereumMainnet = 'ETH',
    EthereumGoerli = 'ETH',
    PolygonMumbai = 'MATIC',
    PolygonMainnet = 'MATIC'
}

export enum EventType {
    GROUP_SUBSCRIBE = 'group_subscribe',
    GROUP_RESUBSCRIBE = 'group_resubscribe',
    GROUP_UNSUBSCRIBE = 'group_unsubscribe',
    SPAMREPORT = 'spamreport',
    DROPPED = 'dropped',
    BOUNCE = 'bounce',
    CLICK = 'click',
    OPEN = 'open',
    DELIVERED = 'delivered',
    DEFERRED = 'deferred',
    PROCESSED = 'processed'
}

export enum ContractDeployStatus {
    ONGOING = 'ONGOING',
    DEPLOYED = 'DEPLOYED'
}

export enum PlatformSalesTopic {
    LOOKSRARE = '0x68cd251d4d267c6e2034ff0088b990352b97b2002c0476587d0c4da889c11330',
    RARIBLE = '0x268820db288a211986b26a8fda86b1e0046281b21206936bb0e61c67b5c79ef4',
    SEAPORT = '0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31',
    X2Y2 = '0x3cbb63f144840e5b1b0a38a7c19211d2e89de4d7c5faf8b2d3c1776c302d1d33'
}

export enum BlockHash {
    FIRST = '0x0',
    LAST = 'latest'
}

export enum ChainId {
    ETHEREUMGOERLI = 5,
    ETHEREUMMAINNET = 1,
    POLYGONMAINNET = 137,
    POLYGONMUMBAI = 1337
}

export enum ChainIdHexa {
    ETHEREUMGOERLI = '0x5',
    ETHEREUMMAINNET = '0x1',
    POLYGONMAINNET = '0x89',
    POLYGONMUMBAI = '0x13881'
}

export enum ChainName {
    ETHEREUMGOERLI = 'ethereum-goerli',
    ETHEREUMMAINNET = 'ethereum-mainnet',
    POLYGONMAINNET = 'polygon-mainnet',
    POLYGONMUMBAI = 'polygon-mumbai'
}
