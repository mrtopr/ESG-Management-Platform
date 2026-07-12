import prisma from '../../config/db.js';
import bcrypt from 'bcrypt';

export async function createEmployee(data) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return prisma.employee.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      departmentId: data.departmentId,
      role: data.role
    }
  });
}

export async function getEmployees() {
  // Select only needed fields (Phase 4.2 optimization)
  return prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: { select: { name: true, code: true } }
    }
  });
}
