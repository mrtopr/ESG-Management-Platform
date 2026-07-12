import { Router } from 'express';
import { createEmployee, getEmployees } from './employee.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/role.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const empSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  departmentId: z.string().uuid(),
  role: z.enum(['EMPLOYEE', 'DEPT_HEAD', 'ESG_ADMIN']).optional()
});

router.use(requireAuth);
router.use(requireRole(['ESG_ADMIN']));

router.post('/', validate(empSchema), createEmployee);
router.get('/', getEmployees);

export default router;
