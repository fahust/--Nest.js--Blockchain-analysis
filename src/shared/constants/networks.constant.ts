import { INetwork } from '../interfaces';

export const networks: Record<string, INetwork> = {
    'mainnet-polygon': {
        name: 'mainnet-polygon',
        rpcUrl: 'https://polygon-rpc.com/',
        websocketUrl: 'wss://rpc-mainnet.matic.network',
        chainId: 137,
        currency: 'MATIC',
        chainExplorerUrl: 'https://polygonscan.com/'
    },
    'mainnet-ethereum': {
        name: 'mainnet-ethereum',
        rpcUrl: 'https://mainnet.infura.io/v3/',
        websocketUrl: 'wss://mainnet.infura.io/ws/',
        chainId: 1,
        currency: 'ETH',
        chainExplorerUrl: 'https://etherscan.io/'
    },
    'testnet-polygon-mumbai': {
        name: 'testnet-polygon-mumbai',
        rpcUrl: 'https://rpc-mumbai.matic.today',
        websocketUrl: 'wss://rpc-mumbai.matic.today',
        chainId: 80001,
        currency: 'MATIC',
        chainExplorerUrl: 'https://mumbai.polygonscan.com/'
    },
    'testnet-ethereum-goerli': {
        name: 'testnet-ethereum-goerli',
        rpcUrl: 'https://goerli.infura.io/v3/',
        websocketUrl: 'wss://goerli.infura.io/ws/',
        chainId: 5,
        currency: 'ETH',
        chainExplorerUrl: 'https://goerli.etherscan.io/'
    }
};
