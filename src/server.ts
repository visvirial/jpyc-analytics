
import { ethers } from 'ethers';
import { PrismaClient, Prisma } from '@prisma/client';
import express from 'express';
import morgan from 'morgan';

import { valueToDecimalStr } from './util';
import { config } from './config';

export const main = async () => {
	// Establish a database connection.
	const prisma = new PrismaClient({
		//log: ['query'],
	});
	// Initialize express server.
	const app: express.Express = express();
	app.use(express.json());
	app.use(morgan('tiny'));
	// Allow CORS accesses.
	app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "*")
		res.header("Access-Control-Allow-Headers", "*");
		next();
	});
	// /txs
	app.get('/txs', async (req: express.Request, res: express.Response) => {
		const PER_PAGE = 100;
		const offset = Number.parseInt((req.query.offset as string) || '0');
		const chainsRaw = ((req.query.chains as string) || 'all');
		const chains = (chainsRaw === 'all' ? Object.keys(config.chains) : chainsRaw.split(','));
		const before = Number.parseInt((req.query.before as string) || Number.MAX_SAFE_INTEGER.toString());
		const after = Number.parseInt((req.query.after as string) || '0');
		const valueMin = Number.parseFloat((req.query.valueMin as string) || '0');
		const valueMax = Number.parseFloat((req.query.valueMax as string) || Number.MAX_VALUE.toString());
		const where = {
			chain: {
				in: chains
			},
			timestamp: {
				gte: after,
				lte: before,
			},
			value: {
				gte: valueMin,
				lte: valueMax,
			},
		};
		const txs = await prisma.transaction.findMany({
			take: PER_PAGE,
			skip: offset,
			select: {
				chain: true,
				height: true,
				timestamp: true,
				txhash: true,
				from: true,
				to: true,
				value: true,
			},
			orderBy: {
				timestamp: 'desc',
			},
			where,
		});
		const count = await prisma.transaction.count({
			where,
		});
		res.send({
			count,
			txs,
		});
	});
	// /holders
	const holdersCache = {
		lastUpdate: 0,
		holders: ([] as {
			rank: number,
			chain: string,
			address: string,
			value: Prisma.Decimal,
		}[]),
	};
	app.get('/holders', async (req: express.Request, res: express.Response) => {
		const computeHolders = async () => {
			// Compute incoming values.
			const ins = await prisma.transaction.groupBy({
				by: ['chain', 'to'],
				_sum: {
					value: true,
				},
			});
			// Compute outgoing values.
			const outs = await prisma.transaction.groupBy({
				by: ['chain', 'from'],
				_sum: {
					value: true,
				},
			});
			// Concatinate `ins` and `outs`.
			const holdersObj: { [address: string]: Prisma.Decimal } = {};
			ins.forEach((input) => {
				const key = `${input.chain}_${input.to}`;
				holdersObj[key] = (holdersObj[key] || new Prisma.Decimal(0)).add(input._sum.value || new Prisma.Decimal(0));
			});
			outs.forEach((output) => {
				const key = `${output.chain}_${output.from}`;
				holdersObj[key] = (holdersObj[key] || new Prisma.Decimal(0)).sub(output._sum.value || new Prisma.Decimal(0));
			});
			let holders = [];
			for(const chainAndAddress in holdersObj) {
				const value = holdersObj[chainAndAddress];
				const [chain, address] = chainAndAddress.split('_');
				holders.push({
					rank: -1,
					chain,
					address,
					value,
				});
			}
			// Discard zero balances.
			holders = holders.filter((holder) => holder.value.isPositive() && !holder.value.isZero());
			return holders;
		};
		const offset = Number.parseInt((req.query.offset as string) || '0');
		const limit = Number.parseInt((req.query.limit as string) || '100');
		const chainsRaw = ((req.query.chains as string) || 'all');
		const chains = (chainsRaw === 'all' ? Object.keys(config.chains) : chainsRaw.split(','));
		// Compute holders.
		const getHolders = async () => {
			const CACHE_DURATION = 10 * 1000;
			if(holdersCache.lastUpdate > Date.now() - CACHE_DURATION) {
				return holdersCache.holders;
			} else {
				const holders = await computeHolders();
				holdersCache.lastUpdate = Date.now();
				holdersCache.holders = holders;
				return holders;
			}
		};
		let holders = await getHolders();
		// Extract records on desired chains.
		holders = holders.filter((holder) => chains.indexOf(holder.chain) >= 0);
		// Sort.
		holders.sort((a, b) => b.value.cmp(a.value));
		// Add rank info.
		holders.forEach((holder, i) => holder.rank = i+1);
		res.send({
			count: holders.length,
			holders: holders.slice(offset, offset + limit),
		});
	});
	// /supply
	app.get('/supply', async (req: express.Request, res: express.Response) => {
		const supply: { [chain: string]: Prisma.Decimal } = {};
		for(const chain in config.chains) {
			const chainConfig = config.chains[chain];
			// Create Geth connection.
			const contract = new ethers.Contract(chainConfig.contractAddress, require('./abi_erc20.json'), chainConfig.provider);
			const totalSupply = new Prisma.Decimal(valueToDecimalStr((await contract.totalSupply()).toString()));
			supply[chain] = totalSupply;
		}
		supply.all = Object.values(supply).reduce((acc, s) => acc.add(s), new Prisma.Decimal(0));
		res.send(supply);
	});
	// /addr
	app.get('/addr/:chain/:addr', async (req: express.Request, res: express.Response) => {
		const chain = req.params.chain;
		const addr = req.params.addr;
		const txs = await prisma.transaction.findMany({
			select: {
				chain: true,
				height: true,
				timestamp: true,
				txhash: true,
				from: true,
				to: true,
				value: true,
			},
			orderBy: {
				timestamp: 'desc',
			},
			where: {
				chain,
				OR: [
					{
						from: addr,
					},
					{
						to: addr,
					},
				],
			},
		});
		const balance = txs.reduce((acc, tx) => {
			if(tx.from === addr) {
				return acc.sub(new Prisma.Decimal(tx.value));
			}
			if(tx.to === addr) {
				return acc.add(new Prisma.Decimal(tx.value));
			}
			throw new Error('E: neither tx.from nor tx.to does not contain the target address.');
		}, new Prisma.Decimal(0));
		res.send({
			balance,
			txs,
		});
	});
	// /total_transfers
	app.get('/total_transfers', async (req: express.Request, res: express.Response) => {
		const chainsRaw = ((req.query.chains as string) || 'all');
		const chains = (chainsRaw === 'all' ? Object.keys(config.chains) : chainsRaw.split(','));
		const before = Number.parseInt((req.query.before as string) || Number.MAX_SAFE_INTEGER.toString());
		const after = Number.parseInt((req.query.after as string) || '0');
		const valueMin = Number.parseFloat((req.query.valueMin as string) || '0');
		const valueMax = Number.parseFloat((req.query.valueMax as string) || Number.MAX_VALUE.toString());
		const where = {
			chain: {
				in: chains
			},
			timestamp: {
				gte: after,
				lte: before,
			},
			value: {
				gte: valueMin,
				lte: valueMax,
			},
		};
		const result = await prisma.transaction.aggregate({
			_sum: {
				value: true,
			},
			_count: {
				id: true,
			},
			where,
		});
		res.send({
			count: result._count.id,
			value: result._sum.value,
		});
	});
	// Listen on localhost.
	app.listen(config.server.port, () => {
		console.log(`JPYC Analytics backend is listening at localhost:${config.server.port}`);
	});
};

main();

