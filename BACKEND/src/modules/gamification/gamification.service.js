import prisma from '../../config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError.js';

export async function getPointsBalance(employeeId, tx = prisma) {
  const result = await tx.pointsTransaction.aggregate({
    _sum: { amount: true },
    where: { employeeId },
  });
  return result._sum.amount || 0;
}

export async function redeemReward(employeeId, rewardId) {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.reward.findUnique({ where: { id: rewardId } });
    if (!reward) throw new AppError(404, 'Reward not found');
    if (reward.stock < 1) throw new AppError(400, 'Out of stock');
    
    const balance = await getPointsBalance(employeeId, tx);
    if (balance < reward.pointsRequired) throw new AppError(400, 'Insufficient points');
    
    await tx.reward.update({ 
      where: { id: rewardId }, 
      data: { stock: { decrement: 1 } } 
    });
    
    await tx.pointsTransaction.create({
      data: { 
        employeeId, 
        sourceType: 'REDEMPTION', 
        sourceId: rewardId, 
        amount: -reward.pointsRequired 
      },
    });
    
    return tx.redemption.create({ 
      data: { employeeId, rewardId, pointsSpent: reward.pointsRequired } 
    });
  });
}

export async function getLeaderboard(departmentId) {
  if (departmentId) {
    return prisma.$queryRaw`
      SELECT e.id, e.name, COALESCE(SUM(pt.amount), 0) as xp,
      RANK() OVER (ORDER BY COALESCE(SUM(pt.amount), 0) DESC) as rank
      FROM "Employee" e
      LEFT JOIN "PointsTransaction" pt ON pt."employeeId" = e.id
      WHERE e."departmentId" = ${departmentId}::uuid
      GROUP BY e.id ORDER BY xp DESC LIMIT 20;
    `;
  }
  return prisma.$queryRaw`
    SELECT e.id, e.name, COALESCE(SUM(pt.amount), 0) as xp,
    RANK() OVER (ORDER BY COALESCE(SUM(pt.amount), 0) DESC) as rank
    FROM "Employee" e
    LEFT JOIN "PointsTransaction" pt ON pt."employeeId" = e.id
    GROUP BY e.id ORDER BY xp DESC LIMIT 20;
  `;
}
