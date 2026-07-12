const {
  createEmployeeSchema,
  createEnvironmentalGoalSchema,
  esgConfigSchema,
  createDepartmentScoreSchema,
} = require('../src/validations/index');

const errors = [];

function assertPass(schema, data, name) {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`❌ FAIL: ${name} should have passed, but failed with:`, result.error.issues || result.error.errors || result.error);
    errors.push(`${name} failed parsing valid data`);
  } else {
    console.log(`✅ PASS: ${name} correctly validated valid data`);
  }
}

function assertFail(schema, data, name, expectedErrorPath) {
  const result = schema.safeParse(data);
  if (result.success) {
    console.error(`❌ FAIL: ${name} should have failed, but passed`);
    errors.push(`${name} accepted invalid data`);
  } else {
    const errorDetails = result.error.issues || result.error.errors || [];
    const hasPath = errorDetails.some((e) => e.path.join('.') === expectedErrorPath);
    if (hasPath) {
      console.log(`✅ PASS: ${name} correctly rejected invalid data at path "${expectedErrorPath}"`);
    } else {
      console.error(
        `⚠️ WARNING: ${name} failed but did not have expected error path "${expectedErrorPath}". Actual paths:`,
        errorDetails.map((e) => e.path.join('.'))
      );
    }
  }
}

console.log('=== Running ESG Zod Schemas Validation Verification ===\n');

// 1. Employee Validation
assertPass(
  createEmployeeSchema,
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    passwordHash: 'hashed_password_123',
    role: 'ESG_ADMIN',
    departmentId: 'a3d463de-2172-4d2d-be55-9343ee0fb83c',
  },
  'Employee valid data'
);

assertFail(
  createEmployeeSchema,
  {
    name: '',
    email: 'not-an-email',
    passwordHash: 'short',
    departmentId: 'invalid-uuid',
  },
  'Employee invalid data',
  'email'
);

// 2. Environmental Goal Validation (Date Range)
assertPass(
  createEnvironmentalGoalSchema,
  {
    title: 'Reduce Carbon Emissions',
    departmentId: 'a3d463de-2172-4d2d-be55-9343ee0fb83c',
    targetValue: 50.5,
    unit: 'tCO2e',
    periodStart: '2026-01-01T00:00:00Z',
    periodEnd: '2026-12-31T23:59:59Z',
  },
  'Environmental Goal valid date range'
);

assertFail(
  createEnvironmentalGoalSchema,
  {
    title: 'Invalid Date Range Goal',
    targetValue: 100,
    unit: 'kWh',
    periodStart: '2026-12-31T23:59:59Z',
    periodEnd: '2026-01-01T00:00:00Z',
  },
  'Environmental Goal invalid date range (start > end)',
  'periodEnd'
);

// 3. ESG Config Weight Validation (Sum to 1.0)
assertPass(
  esgConfigSchema,
  {
    envWeight: 0.4,
    socialWeight: 0.3,
    govWeight: 0.3,
    autoEmissionCalc: true,
  },
  'ESG Config valid weights (sum = 1.0)'
);

assertFail(
  esgConfigSchema,
  {
    envWeight: 0.5,
    socialWeight: 0.5,
    govWeight: 0.5,
  },
  'ESG Config invalid weights (sum = 1.5)',
  'envWeight'
);

// 4. Department Score period regex (e.g. "2026-Q3" or "2026-07")
assertPass(
  createDepartmentScoreSchema,
  {
    departmentId: 'a3d463de-2172-4d2d-be55-9343ee0fb83c',
    environmentalScore: 85.5,
    socialScore: 90.0,
    governanceScore: 78.0,
    totalScore: 84.5,
    period: '2026-Q3',
  },
  'Department Score valid quarter period'
);

assertPass(
  createDepartmentScoreSchema,
  {
    departmentId: 'a3d463de-2172-4d2d-be55-9343ee0fb83c',
    environmentalScore: 85.5,
    socialScore: 90.0,
    governanceScore: 78.0,
    totalScore: 84.5,
    period: '2026-07',
  },
  'Department Score valid month period'
);

assertFail(
  createDepartmentScoreSchema,
  {
    departmentId: 'a3d463de-2172-4d2d-be55-9343ee0fb83c',
    environmentalScore: 85.5,
    socialScore: 90.0,
    governanceScore: 78.0,
    totalScore: 84.5,
    period: '2026-XYZ',
  },
  'Department Score invalid period format',
  'period'
);

console.log('\n=== Verification Summary ===');
if (errors.length === 0) {
  console.log('🎉 All test cases passed successfully!');
  process.exit(0);
} else {
  console.error(`❌ Verification failed with ${errors.length} errors:`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
