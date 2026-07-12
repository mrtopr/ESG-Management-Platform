import prisma from '../../config/db.js';
import { getEsgConfig } from '../settings/settings.service.js';

export async function createCarbonTransaction(data) {
  const config = await getEsgConfig();
  if (config.autoEmissionCalc && data.quantity) {
    const factor = await prisma.emissionFactor.findUnique({ where: { id: data.emissionFactorId } });
    if (factor) {
      data.co2Amount = data.quantity * factor.factorValue;
    }
  }
  return prisma.carbonTransaction.create({ data });
}

export async function getCarbonTransactions(page = 1, limit = 20) {
  return prisma.carbonTransaction.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { date: 'desc' },
  });
}
