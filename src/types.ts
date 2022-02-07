
import { ethers } from 'ethers';

export interface ChainConfig {
	genesisHeight: number;
	provider: ethers.providers.Provider;
	contractAddress: string;
	batchBlocks: number;
}

export interface ChainConfigs {
	[chain: string]: ChainConfig;
}

export interface ServerConfig {
	port: number;
}

export interface Config {
	syncInterval: number;
	chains: ChainConfigs;
	server: ServerConfig;
}

