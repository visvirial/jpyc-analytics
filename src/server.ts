
import { ethers } from 'ethers';
import { PrismaClient, Prisma } from '@prisma/client';
import express from 'express';
import morgan from 'morgan';

import { valueToDecimalStr } from './util';
import { config } from './config';

export const main = async () => {
	// Establish a database connection.
	const prisma = new PrismaClient();
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
	app.get('/holders', async (req: express.Request, res: express.Response) => {
		const PER_PAGE = 100;
		const offset = Number.parseInt((req.query.offset as string) || '0');
		const chainsRaw = ((req.query.chains as string) || 'all');
		const chains = (chainsRaw === 'all' ? Object.keys(config.chains) : chainsRaw.split(','));
		const before = Number.parseInt((req.query.before as string) || Number.MAX_SAFE_INTEGER.toString());
		const where = {
			chain: {
				in: chains
			},
			timestamp: {
				lte: before,
			},
		};
		// Compute incoming values.
		const ins = await prisma.transaction.groupBy({
			by: ['chain', 'to'],
			_sum: {
				value: true,
			},
			where,
		});
		// Compute outgoing values.
		const outs = await prisma.transaction.groupBy({
			by: ['chain', 'from'],
			_sum: {
				value: true,
			},
			where,
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
				chain,
				address,
				value,
			});
		}
		// Discard zero balances.
		holders = holders.filter((holder) => holder.value.isPositive() && !holder.value.isZero());
		// Sort.
		holders.sort((a, b) => b.value.cmp(a.value));
		res.send({
			count: holders.length,
			holders: holders.slice(offset, offset + PER_PAGE),
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
	// /stat
	app.get('/stat', async (req: express.Request, res: express.Response) => {
		const computeStat = async (range: number) => {
			const stat = await prisma.transaction.groupBy({
				by: ['chain'],
				_sum: {
					value: true,
				},
				_count: {
					value: true,
				},
				where: {
					timestamp: {
						gte: Math.floor(Date.now() / 1000) - range,
					},
				},
			});
			const values: { [chain: string]: Prisma.Decimal } = {};
			const count: { [chain: string]: number } = {};
			stat.forEach((item) => {
				values[item.chain] = (item._sum.value as Prisma.Decimal);
			});
			values.all = stat.reduce((acc, item) => item._sum.value!.add(acc), new Prisma.Decimal(0));
			stat.forEach((item) => {
				count[item.chain] = item._count.value;
			});
			count.all = stat.reduce((acc, item) => item._count.value + acc, 0);
			return {
				values,
				count,
			};
		};
		const stat24h = await computeStat(24 * 60 * 60);
		const stat30d = await computeStat(30 * 24 * 60 * 60);
		const stat356d = await computeStat(356 * 24 * 60 * 60);
		res.send({
			tranfer_values_24h: stat24h.values,
			tranfer_count_24h: stat24h.count,
			tranfer_values_30d: stat30d.values,
			tranfer_count_30d: stat30d.count,
			tranfer_values_356d: stat356d.values,
			tranfer_count_356d: stat356d.count,
		});
	});
	// Listen on localhost.
	app.listen(config.server.port, () => {
		console.log(`JPYC Analytics backend is listening at localhost:${config.server.port}`);
	});
};

main();

