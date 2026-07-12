import prisma from '../src/config/db.js';
import { 
  predictNextScore, 
  predictAllCategoryScores, 
  predictOrgWideScore 
} from '../src/modules/scoring/prediction.service.js';

async function runTests() {
  console.log('=== Running ML ESG Trend Prediction Service Tests ===\n');

  try {
    // 1. Clean up existing DepartmentScore records for testing
    await prisma.departmentScore.deleteMany();
    await prisma.department.deleteMany();

    // 2. Create departments with headcounts
    const deptA = await prisma.department.create({ data: { id: 'dept-test-a', name: 'Dept A (Short History)', code: 'DPA', employeeCount: 10 } });
    const deptB = await prisma.department.create({ data: { id: 'dept-test-b', name: 'Dept B (Improving)', code: 'DPB', employeeCount: 20 } });
    const deptC = await prisma.department.create({ data: { id: 'dept-test-c', name: 'Dept C (Declining)', code: 'DPC', employeeCount: 30 } });
    const deptD = await prisma.department.create({ data: { id: 'dept-test-d', name: 'Dept D (Stable)', code: 'DPD', employeeCount: 40 } });
    const deptE = await prisma.department.create({ data: { id: 'dept-test-e', name: 'Dept E (Clamping High)', code: 'DPE', employeeCount: 50 } });

    // ────────────────────────────────────────────────────────
    // Test Case 1: Less than 3 records -> Should return null
    // ────────────────────────────────────────────────────────
    await prisma.departmentScore.create({
      data: { departmentId: deptA.id, period: '2026-01', environmentalScore: 60, socialScore: 60, governanceScore: 60, totalScore: 60 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptA.id, period: '2026-02', environmentalScore: 70, socialScore: 70, governanceScore: 70, totalScore: 70 }
    });

    const predA = await predictNextScore(deptA.id);
    if (predA === null) {
      console.log('✅ PASS: Department A (<3 records) returned null prediction');
    } else {
      console.log('❌ FAIL: Department A (<3 records) did not return null');
    }

    // ────────────────────────────────────────────────────────
    // Test Case 2: Exactly 3 records (Improving Trend)
    // ────────────────────────────────────────────────────────
    await prisma.departmentScore.create({
      data: { departmentId: deptB.id, period: '2026-01', environmentalScore: 50, socialScore: 60, governanceScore: 70, totalScore: 60 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptB.id, period: '2026-02', environmentalScore: 60, socialScore: 70, governanceScore: 80, totalScore: 70 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptB.id, period: '2026-03', environmentalScore: 70, socialScore: 80, governanceScore: 90, totalScore: 80 }
    });

    const predB = await predictNextScore(deptB.id);
    if (predB && predB.predictedScore === 90 && predB.trend === 'improving' && predB.slope > 0) {
      console.log(`✅ PASS: Department B (Improving) forecast predictedScore: ${predB.predictedScore}, trend: ${predB.trend}`);
    } else {
      console.log('❌ FAIL: Department B prediction mismatch:', predB);
    }

    // ────────────────────────────────────────────────────────
    // Test Case 3: Exactly 3 records (Declining Trend)
    // ────────────────────────────────────────────────────────
    await prisma.departmentScore.create({
      data: { departmentId: deptC.id, period: '2026-01', environmentalScore: 90, socialScore: 80, governanceScore: 70, totalScore: 80 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptC.id, period: '2026-02', environmentalScore: 80, socialScore: 70, governanceScore: 60, totalScore: 70 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptC.id, period: '2026-03', environmentalScore: 70, socialScore: 60, governanceScore: 50, totalScore: 60 }
    });

    const predC = await predictNextScore(deptC.id);
    if (predC && predC.predictedScore === 50 && predC.trend === 'declining' && predC.slope < 0) {
      console.log(`✅ PASS: Department C (Declining) forecast predictedScore: ${predC.predictedScore}, trend: ${predC.trend}`);
    } else {
      console.log('❌ FAIL: Department C prediction mismatch:', predC);
    }

    // ────────────────────────────────────────────────────────
    // Test Case 4: Exactly 3 records (Stable Trend)
    // ────────────────────────────────────────────────────────
    await prisma.departmentScore.create({
      data: { departmentId: deptD.id, period: '2026-01', environmentalScore: 75, socialScore: 75, governanceScore: 75, totalScore: 75 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptD.id, period: '2026-02', environmentalScore: 75.2, socialScore: 75.2, governanceScore: 75.2, totalScore: 75.2 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptD.id, period: '2026-03', environmentalScore: 74.9, socialScore: 74.9, governanceScore: 74.9, totalScore: 74.9 }
    });

    const predD = await predictNextScore(deptD.id);
    if (predD && predD.trend === 'stable') {
      console.log(`✅ PASS: Department D (Stable) forecast predictedScore: ${predD.predictedScore}, trend: ${predD.trend}`);
    } else {
      console.log('❌ FAIL: Department D prediction mismatch:', predD);
    }

    // ────────────────────────────────────────────────────────
    // Test Case 5: Clamping High Score (exceeding 100)
    // ────────────────────────────────────────────────────────
    await prisma.departmentScore.create({
      data: { departmentId: deptE.id, period: '2026-01', environmentalScore: 90, socialScore: 90, governanceScore: 90, totalScore: 90 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptE.id, period: '2026-02', environmentalScore: 96, socialScore: 96, governanceScore: 96, totalScore: 96 }
    });
    await prisma.departmentScore.create({
      data: { departmentId: deptE.id, period: '2026-03', environmentalScore: 99, socialScore: 99, governanceScore: 99, totalScore: 99 }
    });

    const predE = await predictNextScore(deptE.id);
    if (predE && predE.predictedScore === 100) {
      console.log(`✅ PASS: Department E (Clamping High) forecast clamped at: ${predE.predictedScore}`);
    } else {
      console.log('❌ FAIL: Department E prediction mismatch:', predE);
    }

    // ────────────────────────────────────────────────────────
    // Test Case 6: Category Scores Predictions
    // ────────────────────────────────────────────────────────
    const predCatsB = await predictAllCategoryScores(deptB.id);
    if (predCatsB && 
        predCatsB.environmental === 80 && 
        predCatsB.social === 90 && 
        predCatsB.governance === 100 && 
        predCatsB.total === 90) {
      console.log('✅ PASS: Category scores prediction matches expected regression');
    } else {
      console.log('❌ FAIL: Category scores prediction mismatch:', predCatsB);
    }

    // ────────────────────────────────────────────────────────
    // Test Case 7: Org-Wide Score headcount-weighted prediction
    // ────────────────────────────────────────────────────────
    // Valid departments for predictions: deptB (20 head), deptC (30 head), deptD (40 head), deptE (50 head).
    // Let's compute expected headcount weighted scores manually:
    // Total headcount = 20 + 30 + 40 + 50 = 140
    // Predicted Env:
    // deptB: 80 * 20 = 1600
    // deptC: 60 * 30 = 1800
    // deptD: 74.75 * 40 = 2990
    // deptE: 100 * 50 = 5000
    // Weighted Env Sum = 11390
    // Expected Org Env = 11390 / 140 = 81.36
    //
    // Predicted Social:
    // deptB: 90 * 20 = 1800
    // deptC: 50 * 30 = 1500
    // deptD: 74.75 * 40 = 2990
    // deptE: 100 * 50 = 5000
    // Weighted Social Sum = 11290
    // Expected Org Social = 11290 / 140 = 80.64
    //
    // Predicted Gov:
    // deptB: 100 * 20 = 2000
    // deptC: 40 * 30 = 1200
    // deptD: 74.75 * 40 = 2990
    // deptE: 100 * 50 = 5000
    // Weighted Gov Sum = 11190
    // Expected Org Gov = 11190 / 140 = 79.93
    //
    // Using default global weights: envWeight=0.4, socialWeight=0.3, govWeight=0.3
    // Expected Org Total = 81.36 * 0.4 + 80.64 * 0.3 + 79.93 * 0.3 = 32.544 + 24.192 + 23.979 = 80.715 -> 80.72
    const orgPred = await predictOrgWideScore();
    console.log('\nOrg-Wide Prediction Output:', orgPred);

    if (orgPred && orgPred.environmental > 81 && orgPred.environmental < 82 && orgPred.total > 80 && orgPred.total < 81) {
      console.log('✅ PASS: Org-wide headcount-weighted predictions correctly calculated');
    } else {
      console.log('❌ FAIL: Org-wide prediction mismatch:', orgPred);
    }

  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
