
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

import { config } from './config';

const prisma = new PrismaClient();

export const sync = async () => {
	for(const chain in config.chains) {
		const chainConfig = config.chains[chain];
		// Create Geth connection.
		const contract = new ethers.Contract(chainConfig.contractAddress, require('./abi_erc20.json'), chainConfig.provider);
		const targetHeight = await chainConfig.provider.getBlockNumber();
		// Get the last block height.
		let syncedHeight =
			(await prisma.transaction.aggregate({
				_max: {
					height: true,
				},
				where: {
					chain,
				},
			}))._max.height ||
				(chainConfig.genesisHeight - 1);
		console.log(`Syncing from ${syncedHeight.toLocaleString()} to ${targetHeight.toLocaleString()}...`);
		// Iterate over blocks.
		for(; syncedHeight<targetHeight; syncedHeight+=chainConfig.batchBlocks) {
			// Fetch "Transfer" events.
			const fromHeight = syncedHeight + 1;
			const toHeight = syncedHeight + chainConfig.batchBlocks;
			console.log(`Fetching Transfer evenets at block number between ${fromHeight.toLocaleString()} and ${toHeight.toLocaleString()}...`);
			const events = await contract.queryFilter(contract.filters.Transfer(), fromHeight, toHeight);
			const txs = [];
			for(const ev of events) {
				const height    = ev.blockNumber;
				const timestamp = (await ev.getBlock()).timestamp;
				const txhash    = ev.transactionHash.slice(2);
				const from      = ev.args!.from;
				const to        = ev.args!.to;
				const value     = ev.args!.value;
				console.log(`#${height.toLocaleString()}: ${from} => ${to}: ${Math.round(value * 1e-18).toLocaleString().padStart(11, ' ')}JPYC`);
				txs.push({
					height,
					timestamp,
					txhash,
					from,
					to,
					value,
				});
			}
			// Insert into the DB.
			if(txs.length <= 0) {
				continue;
			}
			await prisma.transaction.createMany({
				data: txs.map((tx) => {
					const valueStr = tx.value.toString().padStart(19, '0');
					const valueStrDecimal = valueStr.slice(0, -18) + '.' + valueStr.slice(-18);
					return {
						chain,
						height: tx.height,
						timestamp: tx.timestamp,
						txhash: tx.txhash,
						from: tx.from,
						to: tx.to,
						value: valueStrDecimal,
					};
				}),
			});
		}
	}
	await prisma.$disconnect();
};

sync();

