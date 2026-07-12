import * as deptService from './department.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const createDepartment = asyncHandler(async (req, res) => {
  const result = await deptService.createDepartment(req.body);
  res.status(201).json({ success: true, data: result });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const result = await deptService.getDepartments();
  res.json({ success: true, data: result });
});
