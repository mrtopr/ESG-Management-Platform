import * as socialService from './social.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const approveParticipation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const approverId = req.user.id;
  const result = await socialService.approveParticipation(id, approverId);
  res.json({ success: true, data: result });
});
