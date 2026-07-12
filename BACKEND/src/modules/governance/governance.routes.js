import { Router } from 'express';
import { createPolicy, getPolicies } from './governance.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/role.middleware.js';

const router = Router();
router.use(requireAuth);

router.post('/policies', requireRole(['ESG_ADMIN']), createPolicy);
router.get('/policies', getPolicies);

export default router;
