import prisma from '../../config/db.js';
import { getEsgConfig } from '../settings/settings.service.js';

function periodToDateRange(period) {
  const [year, month] = period.split('-');
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); 
  return { start, end };
}

async function calcEnvironmentalScore(departmentId, start, end) {
  return 85; 
}
async function calcSocialScore(departmentId, start, end) { return 90; }
async function calcGovernanceScore(departmentId, start, end) { return 88; }

export async function calculateDepartmentScore(departmentId, period) {
  const config = await getEsgConfig();
  const { start, end } = periodToDateRange(period);
  
  const envScore = await calcEnvironmentalScore(departmentId, start, end);
  const socialScore = await calcSocialScore(departmentId, start, end);
  const govScore = await calcGovernanceScore(departmentId, start, end);
  
  const total = (envScore * config.envWeight) + (socialScore * config.socialWeight) + (govScore * config.govWeight);
  
  return prisma.departmentScore.upsert({
    where: { departmentId_period: { departmentId, period } },
    create: { 
      departmentId, 
      period, 
      environmentalScore: envScore, 
      socialScore, 
      governanceScore: govScore, 
      totalScore: total 
    },
    update: { 
      environmentalScore: envScore, 
      socialScore, 
      governanceScore: govScore, 
      totalScore: total, 
      calculatedAt: new Date() 
    },
  });
}
