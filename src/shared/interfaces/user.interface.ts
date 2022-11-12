export interface IUserNetwork {
    name: string;
    currency: string;
    chainId: number;
    rpcUrl: string;
    websocketUrl: string;
}

export interface IUserStorage {
    original?: string;
    archive?: string;
}

export interface IUserFavoriteWalletAddress {
    name: string;
    description?: string;
    walletAddress: string;
}

export interface IUserCreate {
    walletAddress: string;
}

export interface IUserPhysicalAddress {
    name: string;
    street: string;
    city: string;
    country: string;
    zipcode: string;
    other?: string;
}

export interface IUserMarketplace {
    contractAddress: string;
    network: IUserNetwork;
}

export interface IUserSocial {
    instagram?: string;
    twitter?: string;
}

export interface IUserUpdate {
    email?: string;
    firstName?: string;
    lastName?: string;
    brandName?: string;
    userName?: string;
    phones?: string[];
    hasNewsletter?: boolean;
    favoriteWalletAddresses?: IUserFavoriteWalletAddress[];
    physicalAddress?: IUserPhysicalAddress;
}

export interface IUser extends UserBase {
    _id?: string;
}

export interface UserBase {
    walletAddress: string;
    locale: string;
    email?: string;
    thumbnail?: IUserStorage;
    firstName?: string;
    lastName?: string;
    brandName?: string;
    userName?: string;
    phones?: string[];
    hasNewsletter: boolean;
    apiKey: string;
    secretApiKey: string;
    salt: string;
    favoriteWalletAddresses?: IUserFavoriteWalletAddress[];
    physicalAddress?: IUserPhysicalAddress;
    marketplaces?: IUserMarketplace[];
    permissions: string[];
    social?: IUserSocial;
}
