import { PrismaClient } from '@prisma/client';
import { logger } from '../common/logger/logger.js';

const prisma = new PrismaClient();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
  process.exit(0);
});

export default prisma;
