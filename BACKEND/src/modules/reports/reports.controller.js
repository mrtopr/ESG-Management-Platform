import * as reportsService from './reports.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const exportReport = asyncHandler(async (req, res) => {
  const { format, departmentId, dateFrom, dateTo, includeEnv, includeSocial, includeGov } = req.query;

  const filters = {
    departmentId,
    dateFrom,
    dateTo,
    includeEnv: includeEnv !== 'false',
    includeSocial: includeSocial !== 'false',
    includeGov: includeGov !== 'false'
  };

  const data = await reportsService.getReportData(filters);
  const filename = `esg-report-${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    const csv = reportsService.toCsv(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${filename}.csv`);
    return res.send(csv);
  }

  if (format === 'excel') {
    const excel = reportsService.toExcel(data);
    res.header('Content-Type', 'application/vnd.ms-excel');
    res.attachment(`${filename}.xls`);
    return res.send(excel);
  }

  if (format === 'pdf') {
    const pdf = reportsService.toPdf(data);
    res.header('Content-Type', 'text/plain');
    res.attachment(`${filename}.txt`);
    return res.send(pdf);
  }

  res.json({ success: true, data });
});
