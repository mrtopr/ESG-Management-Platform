import prisma from '../../config/db.js';

export async function createDepartment(data) {
  return prisma.department.create({ data });
}

export async function getDepartments() {
  return prisma.department.findMany();
}
