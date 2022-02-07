
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

export interface Config {
	chains: ChainConfigs;
}

