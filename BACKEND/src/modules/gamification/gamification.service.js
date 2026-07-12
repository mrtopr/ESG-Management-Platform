import prisma from '../../config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError.js';
import { eventBus } from '../../shared/events/eventBus.js';

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
    
    const redemption = await tx.redemption.create({ 
      data: { employeeId, rewardId, pointsSpent: reward.pointsRequired } 
    });

    eventBus.emit('points.updated', { employeeId });

    return redemption;
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

// ==========================================
// NEW GAMIFICATION SERVICES
// ==========================================

export async function getChallenges() {
  return prisma.challenge.findMany({
    include: {
      category: true,
    },
    orderBy: {
      deadline: 'asc',
    },
  });
}

export async function createChallenge(data) {
  return prisma.challenge.create({
    data: {
      title: data.title,
      categoryId: data.categoryId,
      description: data.description || null,
      xp: Number(data.xp),
      difficulty: data.difficulty,
      evidenceRequired: !!data.evidenceRequired,
      deadline: new Date(data.deadline),
      status: data.status || 'ACTIVE',
    },
  });
}

export async function getChallengeParticipations() {
  return prisma.challengeParticipation.findMany({
    include: {
      challenge: true,
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function participateInChallenge(employeeId, challengeId) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new AppError(404, 'Challenge not found');

  const existing = await prisma.challengeParticipation.findUnique({
    where: { challengeId_employeeId: { challengeId, employeeId } }
  });
  if (existing) return existing;

  return prisma.challengeParticipation.create({
    data: {
      employeeId,
      challengeId,
      progress: 0,
      approvalStatus: 'PENDING',
      xpAwarded: 0,
    },
  });
}

export async function updateChallengeProgress(employeeId, participationId, progress, proofUrl) {
  const participation = await prisma.challengeParticipation.findUnique({
    where: { id: participationId },
    include: { challenge: true },
  });

  if (!participation) throw new AppError(404, 'Challenge participation not found');
  if (participation.employeeId !== employeeId) throw new AppError(403, 'Forbidden');
  if (participation.approvalStatus === 'APPROVED') throw new AppError(400, 'Already approved and completed');

  let approvalStatus = 'PENDING';
  let xpAwarded = 0;

  if (Number(progress) === 100 && !participation.challenge.evidenceRequired) {
    approvalStatus = 'APPROVED';
    xpAwarded = participation.challenge.xp;
  }

  const updatedParticipation = await prisma.$transaction(async (tx) => {
    const updated = await tx.challengeParticipation.update({
      where: { id: participationId },
      data: {
        progress: Number(progress),
        proofUrl: proofUrl || null,
        approvalStatus,
        xpAwarded,
      },
    });

    if (approvalStatus === 'APPROVED') {
      await tx.pointsTransaction.create({
        data: {
          employeeId,
          sourceType: 'CHALLENGE',
          sourceId: participationId,
          amount: xpAwarded,
        },
      });
    }

    return updated;
  });

  if (approvalStatus === 'APPROVED') {
    eventBus.emit('points.updated', { employeeId });
  }

  return updatedParticipation;
}

export async function approveChallengeParticipation(participationId, approverId) {
  return prisma.$transaction(async (tx) => {
    const participation = await tx.challengeParticipation.findUnique({
      where: { id: participationId },
      include: { challenge: true },
    });

    if (!participation) throw new AppError(404, 'Participation not found');
    if (participation.approvalStatus === 'APPROVED') throw new AppError(400, 'Already approved');

    const updated = await tx.challengeParticipation.update({
      where: { id: participationId },
      data: {
        approvalStatus: 'APPROVED',
        xpAwarded: participation.challenge.xp,
      },
    });

    await tx.pointsTransaction.create({
      data: {
        employeeId: participation.employeeId,
        sourceType: 'CHALLENGE',
        sourceId: participationId,
        amount: participation.challenge.xp,
      },
    });

    eventBus.emit('points.updated', { employeeId: participation.employeeId });

    return updated;
  });
}

export async function rejectChallengeParticipation(participationId, approverId) {
  return prisma.challengeParticipation.update({
    where: { id: participationId },
    data: {
      approvalStatus: 'REJECTED',
    },
  });
}

export async function getBadges() {
  return prisma.badge.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getEmployeeBadges() {
  return prisma.employeeBadge.findMany({
    include: {
      badge: true,
    },
    orderBy: {
      awardedAt: 'desc',
    },
  });
}

export async function getRewards() {
  return prisma.reward.findMany({
    where: {
      status: 'active',
    },
    orderBy: {
      pointsRequired: 'asc',
    },
  });
}

export async function createReward(data) {
  return prisma.reward.create({
    data: {
      name: data.name,
      description: data.description,
      pointsRequired: Number(data.pointsRequired),
      stock: Number(data.stock),
      status: data.status || 'active',
    },
  });
}
