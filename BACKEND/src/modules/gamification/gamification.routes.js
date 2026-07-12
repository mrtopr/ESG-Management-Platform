import { Router } from 'express';
import { 
  redeemReward, getLeaderboard, getChallenges, createChallenge, 
  getChallengeParticipations, participateInChallenge, updateChallengeProgress, 
  approveChallengeParticipation, rejectChallengeParticipation, getBadges, 
  getEmployeeBadges, getRewards, createReward 
} from './gamification.controller.js';
import { requireAuth } from '../../shared/middleware/auth.middleware.js';
import { requireRole } from '../../shared/middleware/role.middleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();
router.use(requireAuth);

const redeemLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 }); 

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Rewards Shop
router.get('/rewards', getRewards);
router.post('/rewards', requireRole(['ESG_ADMIN']), createReward);
router.post('/rewards/:rewardId/redeem', redeemLimiter, redeemReward);

// Badges
router.get('/badges', getBadges);
router.get('/employee-badges', getEmployeeBadges);

// Challenges
router.get('/challenges', getChallenges);
router.post('/challenges', requireRole(['ESG_ADMIN']), createChallenge);
router.post('/challenges/:challengeId/join', participateInChallenge);
router.get('/challenges/participations', getChallengeParticipations);
router.patch('/challenges/participations/:id', updateChallengeProgress);
router.post('/challenges/participations/:id/approve', requireRole(['ESG_ADMIN', 'DEPT_HEAD']), approveChallengeParticipation);
router.post('/challenges/participations/:id/reject', requireRole(['ESG_ADMIN', 'DEPT_HEAD']), rejectChallengeParticipation);

export default router;
