import prisma from '../../config/db.js';

export async function createPolicy(data) {
  return prisma.policy.create({ data });
}

export async function getPolicies() {
  return prisma.policy.findMany();
}
