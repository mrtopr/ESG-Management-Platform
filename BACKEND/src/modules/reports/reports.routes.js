import { Router } from 'express';
import { exportReport } from './reports.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/role.middleware.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole(['ESG_ADMIN', 'DEPT_HEAD']));

router.get('/export', exportReport);

export default router;
