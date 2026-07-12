import prisma from '../../config/db.js';
import { getEsgConfig } from '../settings/settings.service.js';

function periodToDateRange(period) {
  if (period.includes('-Q')) {
    const [year, qStr] = period.split('-Q');
    const quarter = parseInt(qStr, 10);
    const startMonth = (quarter - 1) * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0, 23, 59, 59, 999);
    return { start, end };
  }
  const [year, month] = period.split('-');
  const start = new Date(year, parseInt(month, 10) - 1, 1);
  const end = new Date(year, parseInt(month, 10), 0, 23, 59, 59, 999); 
  return { start, end };
}

async function calcEnvironmentalScore(departmentId, start, end) {
  const transactions = await prisma.carbonTransaction.findMany({
    where: {
      departmentId,
      date: {
        gte: start,
        lte: end
      }
    }
  });
  const totalCo2 = transactions.reduce((sum, t) => sum + t.co2Amount, 0);
  return Math.max(10, Math.round((100 - (totalCo2 / 50)) * 10) / 10);
}

async function calcSocialScore(departmentId, start, end) {
  const employees = await prisma.employee.findMany({
    where: { departmentId },
    select: { id: true }
  });
  const employeeIds = employees.map(e => e.id);
  
  if (employeeIds.length === 0) {
    return 60; // baseline score if no employees
  }

  const participations = await prisma.employeeParticipation.findMany({
    where: {
      employeeId: { in: employeeIds },
      approvalStatus: 'APPROVED',
      createdAt: {
        gte: start,
        lte: end
      }
    }
  });

  const approvedCSRCount = participations.length;
  return Math.min(100, 60 + (approvedCSRCount * 10));
}

async function calcGovernanceScore(departmentId, start, end) {
  const audits = await prisma.audit.findMany({
    where: {
      departmentId,
      date: {
        gte: start,
        lte: end
      }
    },
    select: { id: true }
  });
  const auditIds = audits.map(a => a.id);

  if (auditIds.length === 0) {
    return 100; // baseline perfect score if no audits/issues logged
  }

  const issues = await prisma.complianceIssue.findMany({
    where: {
      auditId: { in: auditIds }
    }
  });

  const openCount = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
  const overdueCount = issues.filter(i => i.status === 'OVERDUE').length;
  
  return Math.max(0, 100 - (openCount * 15) - (overdueCount * 30));
}

export async function calculateDepartmentScore(departmentId, period) {
  const config = await getEsgConfig();
  const { start, end } = periodToDateRange(period);
  
  const envScore = await calcEnvironmentalScore(departmentId, start, end);
  const socialScore = await calcSocialScore(departmentId, start, end);
  const govScore = await calcGovernanceScore(departmentId, start, end);
  
  const total = (envScore * config.envWeight) + (socialScore * config.socialWeight) + (govScore * config.govWeight);
  const roundedTotal = Math.round(total * 10) / 10;
  
  return prisma.departmentScore.upsert({
    where: { departmentId_period: { departmentId, period } },
    create: { 
      departmentId, 
      period, 
      environmentalScore: envScore, 
      socialScore, 
      governanceScore: govScore, 
      totalScore: roundedTotal 
    },
    update: { 
      environmentalScore: envScore, 
      socialScore, 
      governanceScore: govScore, 
      totalScore: roundedTotal, 
      calculatedAt: new Date() 
    },
  });
}

