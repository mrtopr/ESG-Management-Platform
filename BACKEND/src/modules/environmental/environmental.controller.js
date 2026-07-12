import * as envService from './environmental.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const createCarbonTransaction = asyncHandler(async (req, res) => {
  const result = await envService.createCarbonTransaction(req.body);
  res.status(201).json({ success: true, data: result });
});

export const getCarbonTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await envService.getCarbonTransactions(page, limit);
  res.json({ success: true, data: result });
});
