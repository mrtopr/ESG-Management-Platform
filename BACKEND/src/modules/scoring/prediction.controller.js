import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { AppError } from '../../shared/errors/AppError.js';
import { predictAllCategoryScores, predictOrgWideScore } from './prediction.service.js';

export const getDepartmentPrediction = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  let prediction;
  if (departmentId === 'org') {
    prediction = await predictOrgWideScore();
  } else {
    prediction = await predictAllCategoryScores(departmentId);
  }

  if (!prediction) {
    throw new AppError(400, 'Not enough historical data yet — at least 3 periods required.');
  }

  res.json({ success: true, data: prediction });
});
