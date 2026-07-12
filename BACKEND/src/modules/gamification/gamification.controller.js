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

// ==========================================
// NEW GAMIFICATION CONTROLLER HANDLERS
// ==========================================

export const getChallenges = asyncHandler(async (req, res) => {
  const result = await gamificationService.getChallenges();
  res.json({ success: true, data: result });
});

export const createChallenge = asyncHandler(async (req, res) => {
  const result = await gamificationService.createChallenge(req.body);
  res.status(201).json({ success: true, data: result });
});

export const getChallengeParticipations = asyncHandler(async (req, res) => {
  const result = await gamificationService.getChallengeParticipations();
  res.json({ success: true, data: result });
});

export const participateInChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const employeeId = req.user.id;
  const result = await gamificationService.participateInChallenge(employeeId, challengeId);
  res.status(201).json({ success: true, data: result });
});

export const updateChallengeProgress = asyncHandler(async (req, res) => {
  const { id } = req.params; // participation id
  const { progress, proofUrl } = req.body;
  const employeeId = req.user.id;
  const result = await gamificationService.updateChallengeProgress(employeeId, id, progress, proofUrl);
  res.json({ success: true, data: result });
});

export const approveChallengeParticipation = asyncHandler(async (req, res) => {
  const { id } = req.params; // participation id
  const approverId = req.user.id;
  const result = await gamificationService.approveChallengeParticipation(id, approverId);
  res.json({ success: true, data: result });
});

export const rejectChallengeParticipation = asyncHandler(async (req, res) => {
  const { id } = req.params; // participation id
  const approverId = req.user.id;
  const result = await gamificationService.rejectChallengeParticipation(id, approverId);
  res.json({ success: true, data: result });
});

export const getBadges = asyncHandler(async (req, res) => {
  const result = await gamificationService.getBadges();
  res.json({ success: true, data: result });
});

export const getEmployeeBadges = asyncHandler(async (req, res) => {
  const result = await gamificationService.getEmployeeBadges();
  res.json({ success: true, data: result });
});

export const getRewards = asyncHandler(async (req, res) => {
  const result = await gamificationService.getRewards();
  res.json({ success: true, data: result });
});

export const createReward = asyncHandler(async (req, res) => {
  const result = await gamificationService.createReward(req.body);
  res.status(201).json({ success: true, data: result });
});
