import * as scoringService from './scoring.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const calculateDepartmentScore = asyncHandler(async (req, res) => {
  const { departmentId, period } = req.body;
  const result = await scoringService.calculateDepartmentScore(departmentId, period);
  res.json({ success: true, data: result });
});
