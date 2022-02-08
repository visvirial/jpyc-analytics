
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

import { valueToDecimalStr } from './util';
import { config } from './config';

export const syncOnceByChain = async (prisma: PrismaClient, chain: string) => {
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
	console.log(`${chain}: Syncing from ${syncedHeight.toLocaleString()} to ${targetHeight.toLocaleString()}...`);
	// Iterate over blocks.
	for(; syncedHeight<targetHeight; syncedHeight+=chainConfig.batchBlocks) {
		// Fetch "Transfer" events.
		const fromHeight = syncedHeight + 1;
		const toHeight = Math.min(syncedHeight + chainConfig.batchBlocks, targetHeight);
		console.log(`${chain}: Fetching Transfer evenets at block number between ${fromHeight.toLocaleString()} and ${toHeight.toLocaleString()}...`);
		const events = await contract.queryFilter(contract.filters.Transfer(), fromHeight, toHeight);
		if(events.length <= 0) {
			continue;
		}
		const txs = await Promise.all(events.map(async (ev) => {
			const height    = ev.blockNumber;
			const timestamp = (await ev.getBlock()).timestamp;
			const txhash    = ev.transactionHash.slice(2);
			const from      = ev.args!.from;
			const to        = ev.args!.to;
			const value     = ev.args!.value;
			console.log(`${chain}: #${height.toLocaleString()}: ${from} => ${to}: ${Math.round(value * 1e-18).toLocaleString().padStart(11, ' ')}JPYC`);
			return {
				height,
				timestamp,
				txhash,
				from,
				to,
				value,
			};
		}));
		// Insert into the DB.
		await prisma.transaction.createMany({
			data: txs.map((tx) => {
				const valueStrDecimal = valueToDecimalStr(tx.value.toString());
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
};

export const syncOnce = async (prisma: PrismaClient) => {
	await Promise.all(Object.keys(config.chains).map((chain) => {
		return syncOnceByChain(prisma, chain);
	}));
};

export const syncWithInterval = async (prisma: PrismaClient, interval: number) => {
	try {
		const begin = Date.now();
		await syncOnce(prisma);
		const end = Date.now();
		console.log(`Synced in ${(end-begin).toLocaleString()}ms.`);
	} catch(e) {
		console.log(e);
	}
	setTimeout(() => { syncWithInterval(prisma, interval); }, interval);
}

export const main = async () => {
	// Establish a database connection.
	const prisma = new PrismaClient();
	// Run syncer.
	await syncWithInterval(prisma, config.syncInterval);
};

main();

