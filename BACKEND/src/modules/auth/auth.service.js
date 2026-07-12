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
