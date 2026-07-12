import prisma from '../../config/db.js';
import { eventBus } from '../../shared/events/eventBus.js';
import { getEsgConfig } from '../settings/settings.service.js';
import { AppError } from '../../shared/errors/AppError.js';

export async function approveParticipation(id, approverId) {
  const config = await getEsgConfig();

  return prisma.$transaction(async (tx) => {
    const participation = await tx.employeeParticipation.findUnique({
      where: { id }
    });

    if (!participation) {
      throw new AppError(404, 'Participation record not found');
    }

    if (config.evidenceRequired && !participation.proofUrl) {
      throw new AppError(400, 'Verification evidence (proof file) is required to approve this participation');
    }

    const updated = await tx.employeeParticipation.update({
      where: { id }, 
      data: { approvalStatus: 'APPROVED', pointsEarned: 50 },
    });
    
    await tx.pointsTransaction.create({
      data: { 
        employeeId: updated.employeeId, 
        sourceType: 'CSR', 
        sourceId: id, 
        amount: 50 
      },
    });
    
    eventBus.emit('points.updated', { employeeId: updated.employeeId });
    
    return updated;
  });
}

