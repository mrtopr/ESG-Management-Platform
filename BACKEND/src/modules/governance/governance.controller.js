import * as govService from './governance.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const createPolicy = asyncHandler(async (req, res) => {
  const result = await govService.createPolicy(req.body);
  res.status(201).json({ success: true, data: result });
});

export const getPolicies = asyncHandler(async (req, res) => {
  const result = await govService.getPolicies();
  res.json({ success: true, data: result });
});
