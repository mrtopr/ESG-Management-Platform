import app from './app.js';
import { env } from './config/env.js';
import { logger } from './shared/utils/logger.js';
import prisma from './config/db.js';
import './shared/cron/index.js';

async function startServer() {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connected successfully.');

    app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}
startServer();
