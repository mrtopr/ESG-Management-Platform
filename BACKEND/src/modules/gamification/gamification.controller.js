import * as gamificationService from './gamification.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import './badge.listener.js'; 

export const redeemReward = asyncHandler(async (req, res) => {
  const { rewardId } = req.params;
  const employeeId = req.user.id;
  const result = await gamificationService.redeemReward(employeeId, rewardId);
  res.json({ success: true, data: result });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;
  const result = await gamificationService.getLeaderboard(departmentId);
  const mapped = result.map(row => ({
    ...row,
    xp: row.xp ? row.xp.toString() : '0',
    rank: row.rank ? row.rank.toString() : '0'
  }));
  res.json({ success: true, data: mapped });
});
