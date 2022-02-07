
import { PrismaClient } from '@prisma/client';
import express from 'express';

import { config } from './config';

export const main = async () => {
	// Establish a database connection.
	const prisma = new PrismaClient();
	// Initialize express server.
	const app: express.Express = express();
	app.use(express.json());
	// Allow CORS accesses.
	app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "*")
		res.header("Access-Control-Allow-Headers", "*");
		next();
	});
	app.get('/txs', async (req: express.Request, res: express.Response) => {
		const PER_PAGE = 10;
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
	app.listen(config.server.port, () => {
		console.log(`JPYC Analytics backend is listening at localhost:${config.server.port}`);
	});
};

main();

