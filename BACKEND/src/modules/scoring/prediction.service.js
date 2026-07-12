import regression from 'regression';
import prisma from '../../config/db.js';
import { getEsgConfig } from '../settings/settings.service.js';

const MIN_HISTORY_POINTS = 3;
const STABLE_SLOPE_THRESHOLD = 0.5;

export async function predictNextScore(departmentId) {
  const history = await prisma.departmentScore.findMany({
    where: { departmentId },
    orderBy: { period: 'asc' },
  });

  if (history.length < MIN_HISTORY_POINTS) {
    return null;
  }

  const dataPoints = history.map((record, index) => [index, record.totalScore]);
  const result = regression.linear(dataPoints);
  const nextIndex = history.length;
  const rawPrediction = result.predict(nextIndex)[1];
  const predictedScore = Math.max(0, Math.min(100, rawPrediction));
  const slope = result.equation[0];

  let trend = 'stable';
  if (slope > STABLE_SLOPE_THRESHOLD) trend = 'improving';
  else if (slope < -STABLE_SLOPE_THRESHOLD) trend = 'declining';

  return {
    departmentId,
    predictedScore: Number(predictedScore.toFixed(2)),
    trend,
    slope: Number(slope.toFixed(3)),
    basedOnPeriods: history.length,
  };
}

export async function predictAllCategoryScores(departmentId) {
  const history = await prisma.departmentScore.findMany({
    where: { departmentId },
    orderBy: { period: 'asc' },
  });

  if (history.length < MIN_HISTORY_POINTS) {
    return null;
  }

  const predictField = (fieldName) => {
    const dataPoints = history.map((record, index) => [index, record[fieldName]]);
    const result = regression.linear(dataPoints);
    const rawPrediction = result.predict(history.length)[1];
    return Number(Math.max(0, Math.min(100, rawPrediction)).toFixed(2));
  };

  return {
    departmentId,
    environmental: predictField('environmentalScore'),
    social: predictField('socialScore'),
    governance: predictField('governanceScore'),
    total: predictField('totalScore'),
    basedOnPeriods: history.length,
  };
}

export async function predictOrgWideScore() {
  const departments = await prisma.department.findMany();
  const config = await getEsgConfig();

  let totalEmployees = 0;
  let weightedEnvSum = 0;
  let weightedSocialSum = 0;
  let weightedGovSum = 0;
  let validDeptsCount = 0;

  let simpleEnvSum = 0;
  let simpleSocialSum = 0;
  let simpleGovSum = 0;

  for (const dept of departments) {
    const prediction = await predictAllCategoryScores(dept.id);
    if (prediction) {
      const headcount = dept.employeeCount || 0;
      weightedEnvSum += prediction.environmental * headcount;
      weightedSocialSum += prediction.social * headcount;
      weightedGovSum += prediction.governance * headcount;
      totalEmployees += headcount;

      simpleEnvSum += prediction.environmental;
      simpleSocialSum += prediction.social;
      simpleGovSum += prediction.governance;
      validDeptsCount++;
    }
  }

  if (validDeptsCount === 0) return null;

  const env = totalEmployees > 0 
    ? Number((weightedEnvSum / totalEmployees).toFixed(2))
    : Number((simpleEnvSum / validDeptsCount).toFixed(2));

  const social = totalEmployees > 0 
    ? Number((weightedSocialSum / totalEmployees).toFixed(2))
    : Number((simpleSocialSum / validDeptsCount).toFixed(2));

  const gov = totalEmployees > 0 
    ? Number((weightedGovSum / totalEmployees).toFixed(2))
    : Number((simpleGovSum / validDeptsCount).toFixed(2));

  // Cumulative Weighted Score based on global ESG config weighting rules
  const total = Number(((env * config.envWeight) + (social * config.socialWeight) + (gov * config.govWeight)).toFixed(2));

  return {
    departmentId: 'org',
    environmental: env,
    social,
    governance: gov,
    total,
    basedOnPeriods: validDeptsCount,
  };
}
