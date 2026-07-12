import prisma from '../../config/db.js';
import { eventBus } from '../../shared/events/eventBus.js';
import { getPointsBalance } from './gamification.service.js';
import { getEsgConfig } from '../settings/settings.service.js';

eventBus.on('points.updated', async ({ employeeId }) => {
  try {
    const config = await getEsgConfig();
    if (!config.badgeAutoAward) return;
    
    const balance = await getPointsBalance(employeeId);
    const badges = await prisma.badge.findMany();
    
    for (const badge of badges) {
      const rule = badge.unlockRule;
      if (rule && rule.type === 'xp_threshold' && balance >= rule.value) {
        await prisma.employeeBadge.upsert({
          where: { employeeId_badgeId: { employeeId, badgeId: badge.id } },
          create: { employeeId, badgeId: badge.id },
          update: {},
        });
      }
    }
  } catch (error) {
    console.error('Badge auto-award failed:', error);
  }
});
