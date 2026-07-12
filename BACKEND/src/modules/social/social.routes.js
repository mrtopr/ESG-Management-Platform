import { Router } from 'express';
import { approveParticipation } from './social.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/role.middleware.js';

const router = Router();
router.use(requireAuth);

router.post('/participations/:id/approve', requireRole(['ESG_ADMIN', 'DEPT_HEAD']), approveParticipation);

export default router;
