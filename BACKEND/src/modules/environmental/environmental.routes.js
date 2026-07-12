import { Router } from 'express';
import { createCarbonTransaction, getCarbonTransactions } from './environmental.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { createCarbonTransactionSchema } from '../../validations/index.js';

const router = Router();
router.use(requireAuth);

router.post('/carbon', validate(createCarbonTransactionSchema), createCarbonTransaction);
router.get('/carbon', getCarbonTransactions);

export default router;
