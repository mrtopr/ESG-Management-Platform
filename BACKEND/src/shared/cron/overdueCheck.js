import cron from 'node-cron';
import prisma from '../../config/db.js';
import { logger } from '../utils/logger.js';

// 6 AM daily
cron.schedule('0 6 * * *', async () => {
  try {
    logger.info('Running daily overdue compliance check...');
    const overdue = await prisma.complianceIssue.updateMany({
      where: { 
        status: { in: ['OPEN', 'IN_PROGRESS'] }, 
        dueDate: { lt: new Date() } 
      },
      data: { status: 'OVERDUE' },
    });
    
    if (overdue.count > 0) {
      logger.info(`Marked ${overdue.count} issues as OVERDUE`);
    }
  } catch (error) {
    logger.error('Error in overdueCheck cron:', error);
  }
});
