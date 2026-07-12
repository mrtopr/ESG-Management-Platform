import * as authService from './auth.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
});

export const getMe = asyncHandler(async (req, res) => {
  const employeeId = req.user.id;
  const result = await authService.getEmployeeProfile(employeeId);
  res.json({ success: true, data: result });
});
