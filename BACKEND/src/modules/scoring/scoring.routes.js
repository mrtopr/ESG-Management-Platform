import { Router } from 'express';
import { calculateDepartmentScore } from './scoring.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/role.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const calcSchema = z.object({
  departmentId: z.string().uuid(),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format")
});

router.post('/calculate', requireRole(['ESG_ADMIN']), validate(calcSchema), calculateDepartmentScore);

export default router;
