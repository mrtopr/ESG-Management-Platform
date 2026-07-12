import { Router } from 'express';
import { createDepartment, getDepartments } from './department.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/role.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const deptSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1)
});

router.use(requireAuth);
router.use(requireRole(['ESG_ADMIN', 'DEPT_HEAD']));

router.post('/', validate(deptSchema), createDepartment);
router.get('/', getDepartments);

export default router;
