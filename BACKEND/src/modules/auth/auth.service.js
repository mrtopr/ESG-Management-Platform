import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import prisma from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';

export async function login(email, password) {
  const employee = await prisma.employee.findUnique({ where: { email } });
  
  if (!employee || !(await bcrypt.compare(password, employee.passwordHash))) {
    throw new AppError(401, 'Invalid credentials');
  }
  
  const token = jwt.sign({ id: employee.id, role: employee.role }, env.JWT_SECRET, { expiresIn: '7d' });
  
  return { 
    token, 
    employee: { id: employee.id, name: employee.name, role: employee.role } 
  };
}

export async function getEmployeeProfile(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      department: true,
      badges: {
        include: {
          badge: true
        }
      }
    }
  });
  if (!employee) throw new AppError(404, 'Employee not found');
  
  const pointsRes = await prisma.pointsTransaction.aggregate({
    _sum: { amount: true },
    where: { employeeId },
  });
  const points = pointsRes._sum.amount || 0;
  
  const xpRes = await prisma.pointsTransaction.aggregate({
    _sum: { amount: true },
    where: { employeeId, amount: { gt: 0 } },
  });
  const xp = xpRes._sum.amount || 0;
  
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    departmentId: employee.departmentId,
    departmentName: employee.department.name,
    xp,
    points,
    badges: employee.badges.map(eb => eb.badge)
  };
}
