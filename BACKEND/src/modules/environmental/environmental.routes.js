import { Router } from 'express';
import { createCarbonTransaction, getCarbonTransactions } from './environmental.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const txSchema = z.object({
  departmentId: z.string().uuid(),
  emissionFactorId: z.string().uuid(),
  quantity: z.number().optional(),
  co2Amount: z.number().optional(),
  date: z.string().optional().transform(str => str ? new Date(str) : undefined)
});

router.post('/carbon', validate(txSchema), createCarbonTransaction);
router.get('/carbon', getCarbonTransactions);

export default router;
