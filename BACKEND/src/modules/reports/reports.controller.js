import * as reportsService from './reports.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const exportReport = asyncHandler(async (req, res) => {
  const { format } = req.query; 
  const data = await reportsService.getReportData();
  
  if (format === 'csv') {
    const csv = reportsService.toCsv(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('report.csv');
    return res.send(csv);
  }
  res.json({ success: true, data });
});
