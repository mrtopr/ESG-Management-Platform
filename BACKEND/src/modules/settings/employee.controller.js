import * as empService from './employee.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const createEmployee = asyncHandler(async (req, res) => {
  const result = await empService.createEmployee(req.body);
  res.status(201).json({ success: true, data: result });
});

export const getEmployees = asyncHandler(async (req, res) => {
  const result = await empService.getEmployees();
  res.json({ success: true, data: result });
});
