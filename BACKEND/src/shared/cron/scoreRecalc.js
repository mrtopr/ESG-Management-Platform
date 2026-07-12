import cron from 'node-cron';
import prisma from '../../config/db.js';
import { logger } from '../utils/logger.js';
import { calculateDepartmentScore } from '../../modules/scoring/scoring.service.js';

// 2 AM daily
cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Running daily department score recalculation...');
    const departments = await prisma.department.findMany();
    
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    for (const dept of departments) {
      await calculateDepartmentScore(dept.id, currentPeriod);
    }
    logger.info(`Recalculated scores for ${departments.length} departments.`);
  } catch (error) {
    logger.error('Error in scoreRecalc cron:', error);
  }
});
