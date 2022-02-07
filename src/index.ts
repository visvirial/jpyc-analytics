
import { PrismaClient } from '@prisma/client';

import { syncWithInterval } from './sync';
import { config } from './config';

export const main = async () => {
	// Establish a database connection.
	const prisma = new PrismaClient();
	// Run syncer.
	await syncWithInterval(prisma, config.syncInterval);
};

main();

