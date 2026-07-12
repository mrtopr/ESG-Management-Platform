import prisma from '../../config/db.js';

export async function getReportData(filters = {}) {
  const reportRows = [];
  const { departmentId, dateFrom, dateTo, includeEnv, includeSocial, includeGov } = filters;

  const dateFilter = {};
  if (dateFrom) dateFilter.gte = new Date(dateFrom);
  if (dateTo) dateFilter.lte = new Date(dateTo);

  // 1. Environmental (Carbon Transactions)
  if (includeEnv !== false) {
    const envTxs = await prisma.carbonTransaction.findMany({
      where: {
        departmentId: departmentId || undefined,
        date: Object.keys(dateFilter).length ? dateFilter : undefined
      },
      include: {
        department: true,
        emissionFactor: true
      }
    });

    envTxs.forEach(tx => {
      reportRows.push({
        date: tx.date.toISOString().split('T')[0],
        department: tx.department.name,
        module: 'Environmental',
        activity: `Carbon Log: ${tx.emissionFactor.activity} (Ref: ${tx.sourceId || 'N/A'})`,
        impact: `${tx.co2Amount} kg CO2e`,
        status: 'Committed'
      });
    });
  }

  // 2. Social (Employee CSR Participations)
  if (includeSocial !== false) {
    const socialParts = await prisma.employeeParticipation.findMany({
      where: {
        createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
        employee: departmentId ? { departmentId } : undefined
      },
      include: {
        employee: { include: { department: true } },
        activity: true
      }
    });

    socialParts.forEach(p => {
      reportRows.push({
        date: p.createdAt.toISOString().split('T')[0],
        department: p.employee.department.name,
        module: 'Social',
        activity: `CSR Volunteering: ${p.activity.title} (${p.employee.name})`,
        impact: `+${p.pointsEarned} Points`,
        status: p.approvalStatus
      });
    });
  }

  // 3. Governance (Compliance Issues & Audits)
  if (includeGov !== false) {
    const issues = await prisma.complianceIssue.findMany({
      where: {
        createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
        audit: departmentId ? { departmentId } : undefined
      },
      include: {
        audit: { include: { department: true } },
        owner: true
      }
    });

    issues.forEach(issue => {
      reportRows.push({
        date: issue.createdAt.toISOString().split('T')[0],
        department: issue.audit.department.name,
        module: 'Governance',
        activity: `Compliance Red Flag: ${issue.description} (Owner: ${issue.owner.name})`,
        impact: `Severity: ${issue.severity}`,
        status: issue.status
      });
    });
  }

  // Sort by date descending
  return reportRows.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function toCsv(data) {
  if (!data.length) return '';
  const headers = ['Date', 'Department', 'Module', 'Activity / Disclosure', 'Impact Metric', 'Status'].join(',');
  const rows = data.map(row => [
    `"${row.date}"`,
    `"${row.department.replace(/"/g, '""')}"`,
    `"${row.module}"`,
    `"${row.activity.replace(/"/g, '""')}"`,
    `"${row.impact}"`,
    `"${row.status}"`
  ].join(','));
  return [headers, ...rows].join('\n');
}

export function toExcel(data) {
  return toCsv(data); // CSV format is widely compatible with Excel
}

export function toPdf(data) {
  if (!data.length) return 'No ESG Data available';
  let reportText = '==================================================\n';
  reportText += '               ECOSPHERE ESG REPORT               \n';
  reportText += `           Generated on: ${new Date().toLocaleString()}    \n`;
  reportText += '==================================================\n\n';
  
  data.forEach((row, i) => {
    reportText += `${i + 1}. [${row.date}] [${row.module}] - Dept: ${row.department}\n`;
    reportText += `   Activity: ${row.activity}\n`;
    reportText += `   Impact:   ${row.impact} | Status: ${row.status}\n`;
    reportText += '--------------------------------------------------\n';
  });
  return reportText;
}

