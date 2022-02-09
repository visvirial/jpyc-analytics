
import { ethers } from 'ethers';

import { Config } from './types';

export const config: Config = {
	syncInterval: 10 * 1000,
	chains: {
		eth: {
			genesisHeight: 11_728_884,
			provider: new ethers.providers.JsonRpcProvider(process.env.ETH_RPC),
			contractAddress: '0x2370f9d504c7a6e775bf6e14b3f12846b594cd53',
			batchBlocks: 10_000,
		},
		polygon: {
			genesisHeight: 10_295_672,
			provider: new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/'),
			contractAddress: '0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c',
			batchBlocks: 1_000,
		},
		xdai: {
			genesisHeight: 14_244_133,
			provider: new ethers.providers.JsonRpcProvider('https://rpc.gnosischain.com/'),
			contractAddress: '0x417602f4fbdd471a431ae29fb5fe0a681964c11b',
			batchBlocks: 1_000,
		},
		shiden: {
			genesisHeight: 535_890,
			provider: new ethers.providers.JsonRpcProvider('https://shiden.api.onfinality.io/public'),
			contractAddress: '0x735abe48e8782948a37c7765ecb76b98cde97b0f',
			batchBlocks: 1_000,
		},
	},
	server: {
		port: 10484,
	},
};

