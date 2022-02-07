
import mariadb from 'mariadb';
import { ethers } from 'ethers';

import { config } from './config';

// Create MariaDB connection.
export const initDB = async () => {
	return await mariadb.createConnection(config.db);
};

export const sync = async () => {
	const conn = await initDB();
	for(const chain in config.chains) {
		const chainConfig = config.chains[chain];
		// Create Geth connection.
		const contract = new ethers.Contract(chainConfig.contractAddress, require('./abi_erc20.json'), chainConfig.provider);
		const targetHeight = await chainConfig.provider.getBlockNumber();
		// Get the last block height.
		let syncedHeight =
			((await conn.query('SELECT MAX(height) AS syncedHeight from transactions WHERE chain = ?', [chain]))[0].syncedHeight) ||
				(chainConfig.genesisHeight - 1);
		console.log(`Syncing from ${syncedHeight.toLocaleString()} to ${targetHeight.toLocaleString()}...`);
		// Iterate over blocks.
		const BATCH_BLOCKS = 1000;
		for(; syncedHeight<targetHeight; syncedHeight+=BATCH_BLOCKS) {
			// Fetch "Transfer" events.
			const fromHeight = syncedHeight + 1;
			const toHeight = syncedHeight + BATCH_BLOCKS;
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
			await conn.batch(
				'INSERT INTO transactions VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)',
				txs.map((tx) => {
					const valueStr = tx.value.toString().padStart(19, '0');
					const valueStrDecimal = valueStr.slice(0, -18) + '.' + valueStr.slice(-18);
					return [chain, tx.height, tx.timestamp, tx.txhash, tx.from, tx.to, valueStrDecimal];
				})
			);
		}
	}
};

sync();

