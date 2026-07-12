import prisma from '../../config/db.js';
import { eventBus } from '../../shared/events/eventBus.js';

export async function approveParticipation(id, approverId) {
  return prisma.$transaction(async (tx) => {
    const participation = await tx.employeeParticipation.update({
      where: { id }, 
      data: { approvalStatus: 'APPROVED', pointsEarned: 50 },
    });
    
    await tx.pointsTransaction.create({
      data: { 
        employeeId: participation.employeeId, 
        sourceType: 'CSR', 
        sourceId: id, 
        amount: 50 
      },
    });
    
    eventBus.emit('points.updated', { employeeId: participation.employeeId });
    
    return participation;
  });
}
