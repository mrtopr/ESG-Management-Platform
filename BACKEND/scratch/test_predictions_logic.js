import regression from 'regression';

const MIN_HISTORY_POINTS = 3;
const STABLE_SLOPE_THRESHOLD = 0.5;

// Mock database data in memory
const mockScores = {
  'dept-test-a': [
    { period: '2026-01', environmentalScore: 60, socialScore: 60, governanceScore: 60, totalScore: 60 },
    { period: '2026-02', environmentalScore: 70, socialScore: 70, governanceScore: 70, totalScore: 70 }
  ],
  'dept-test-b': [
    { period: '2026-01', environmentalScore: 50, socialScore: 60, governanceScore: 70, totalScore: 60 },
    { period: '2026-02', environmentalScore: 60, socialScore: 70, governanceScore: 80, totalScore: 70 },
    { period: '2026-03', environmentalScore: 70, socialScore: 80, governanceScore: 90, totalScore: 80 }
  ],
  'dept-test-c': [
    { period: '2026-01', environmentalScore: 90, socialScore: 80, governanceScore: 70, totalScore: 80 },
    { period: '2026-02', environmentalScore: 80, socialScore: 70, governanceScore: 60, totalScore: 70 },
    { period: '2026-03', environmentalScore: 70, socialScore: 60, governanceScore: 50, totalScore: 60 }
  ],
  'dept-test-d': [
    { period: '2026-01', environmentalScore: 75, socialScore: 75, governanceScore: 75, totalScore: 75 },
    { period: '2026-02', environmentalScore: 75.2, socialScore: 75.2, governanceScore: 75.2, totalScore: 75.2 },
    { period: '2026-03', environmentalScore: 74.9, socialScore: 74.9, governanceScore: 74.9, totalScore: 74.9 }
  ],
  'dept-test-e': [
    { period: '2026-01', environmentalScore: 90, socialScore: 90, governanceScore: 90, totalScore: 90 },
    { period: '2026-02', environmentalScore: 96, socialScore: 96, governanceScore: 96, totalScore: 96 },
    { period: '2026-03', environmentalScore: 99, socialScore: 99, governanceScore: 99, totalScore: 99 }
  ]
};

const mockDepartments = [
  { id: 'dept-test-a', name: 'Dept A (Short)', employeeCount: 10 },
  { id: 'dept-test-b', name: 'Dept B (Improving)', employeeCount: 20 },
  { id: 'dept-test-c', name: 'Dept C (Declining)', employeeCount: 30 },
  { id: 'dept-test-d', name: 'Dept D (Stable)', employeeCount: 40 },
  { id: 'dept-test-e', name: 'Dept E (Clamping)', employeeCount: 50 }
];

const mockConfig = {
  envWeight: 0.4,
  socialWeight: 0.3,
  govWeight: 0.3
};

// Target functions with mock data sources
async function mockPredictNextScore(departmentId) {
  const history = mockScores[departmentId] || [];
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

async function mockPredictAllCategoryScores(departmentId) {
  const history = mockScores[departmentId] || [];
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

async function mockPredictOrgWideScore() {
  const departments = mockDepartments;
  const config = mockConfig;

  let totalEmployees = 0;
  let weightedEnvSum = 0;
  let weightedSocialSum = 0;
  let weightedGovSum = 0;
  let validDeptsCount = 0;

  let simpleEnvSum = 0;
  let simpleSocialSum = 0;
  let simpleGovSum = 0;

  for (const dept of departments) {
    const prediction = await mockPredictAllCategoryScores(dept.id);
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

// ────────────────────────────────────────────────────────
// RUN VERIFICATIONS
// ────────────────────────────────────────────────────────
async function verify() {
  console.log('=== Running Mocked ESG Trend Prediction Math Tests ===');

  // Test 1: Short History
  const resA = await mockPredictNextScore('dept-test-a');
  if (resA === null) {
    console.log('✅ PASS: Under 3 periods correctly returned null');
  } else {
    console.log('❌ FAIL: Under 3 periods did not return null');
  }

  // Test 2: Improving
  const resB = await mockPredictNextScore('dept-test-b');
  if (resB && resB.predictedScore === 90 && resB.trend === 'improving' && resB.slope === 10) {
    console.log('✅ PASS: Improving trend correctly fitted (predicted: 90, slope: 10)');
  } else {
    console.log('❌ FAIL: Improving trend prediction incorrect', resB);
  }

  // Test 3: Declining
  const resC = await mockPredictNextScore('dept-test-c');
  if (resC && resC.predictedScore === 50 && resC.trend === 'declining' && resC.slope === -10) {
    console.log('✅ PASS: Declining trend correctly fitted (predicted: 50, slope: -10)');
  } else {
    console.log('❌ FAIL: Declining trend prediction incorrect', resC);
  }

  // Test 4: Stable
  const resD = await mockPredictNextScore('dept-test-d');
  if (resD && resD.trend === 'stable' && Math.abs(resD.slope) < 0.5) {
    console.log(`✅ PASS: Stable trend correctly fitted (predicted: ${resD.predictedScore}, slope: ${resD.slope})`);
  } else {
    console.log('❌ FAIL: Stable trend prediction incorrect', resD);
  }

  // Test 5: Clamping High
  const resE = await mockPredictNextScore('dept-test-e');
  if (resE && resE.predictedScore === 100) {
    console.log('✅ PASS: Clamped output at 100 maximum');
  } else {
    console.log('❌ FAIL: Clamping failed', resE);
  }

  // Test 6: Categories
  const resCatsB = await mockPredictAllCategoryScores('dept-test-b');
  if (resCatsB && resCatsB.environmental === 80 && resCatsB.social === 90 && resCatsB.governance === 100 && resCatsB.total === 90) {
    console.log('✅ PASS: Category scores regression matching expected output');
  } else {
    console.log('❌ FAIL: Category scores regression incorrect', resCatsB);
  }

  // Test 7: Org-Wide
  const resOrg = await mockPredictOrgWideScore();
  console.log('\nOrg Wide Prediction Output:', resOrg);
  if (resOrg && resOrg.environmental === 81.41 && resOrg.social === 80.69 && resOrg.governance === 79.98 && resOrg.total === 80.77) {
    console.log('✅ PASS: headcount-weighted averages and category coefficients sum calculation matches expected values!');
  } else {
    console.log('❌ FAIL: headcount-weighted aggregation failed', resOrg);
  }
}

verify();
