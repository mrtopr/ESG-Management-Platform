import { Router } from 'express';
import { redeemReward, getLeaderboard } from './gamification.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();
router.use(requireAuth);

const redeemLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 }); 

router.post('/rewards/:rewardId/redeem', redeemLimiter, redeemReward);
router.get('/leaderboard', getLeaderboard);

export default router;
