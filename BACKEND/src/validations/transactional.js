const { z } = require('zod');
const {
  SourceTypeSchema,
  ApprovalStatusSchema,
  ChallengeStatusSchema,
  ComplianceSeveritySchema,
  ComplianceStatusSchema,
} = require('./enums');

// ═══════════════════ CARBON TRANSACTION SCHEMAS ═══════════════════

const createCarbonTransactionSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  emissionFactorId: z.string().uuid('Invalid emission factor ID'),
  sourceType: SourceTypeSchema,
  sourceId: z.string().nullable().optional(),
  quantity: z.number().positive('Quantity must be a positive number'),
  co2Amount: z.number().nonnegative('CO2 amount must be non-negative'),
  date: z.coerce.date().optional(),
});

const updateCarbonTransactionSchema = createCarbonTransactionSchema.partial().extend({
  sourceId: z.string().nullable().optional(),
});

// ═══════════════════ CSR ACTIVITY SCHEMAS ═══════════════════

const createCsrActivitySchema = z.object({
  title: z.string().min(1, 'Activity title is required'),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  departmentId: z.string().uuid('Invalid department ID'),
  date: z.coerce.date({ invalid_type_error: 'Invalid date' }),
  status: z.string().optional(),
});

const updateCsrActivitySchema = createCsrActivitySchema.partial().extend({
  description: z.string().nullable().optional(),
});

// ═══════════════════ EMPLOYEE PARTICIPATION SCHEMAS ═══════════════════

const createEmployeeParticipationSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  activityId: z.string().uuid('Invalid activity ID'),
  proofUrl: z.string().url('Invalid proof URL').or(z.string().length(0)).nullable().optional(),
  approvalStatus: ApprovalStatusSchema.optional(),
  pointsEarned: z.number().int().nonnegative().optional(),
  completionDate: z.coerce.date().nullable().optional(),
});

const updateEmployeeParticipationSchema = createEmployeeParticipationSchema.partial().extend({
  proofUrl: z.string().url('Invalid proof URL').or(z.string().length(0)).nullable().optional(),
  completionDate: z.coerce.date().nullable().optional(),
});

// ═══════════════════ CHALLENGE SCHEMAS ═══════════════════

const createChallengeSchema = z.object({
  title: z.string().min(1, 'Challenge title is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  description: z.string().nullable().optional(),
  xp: z.number().int().nonnegative('XP must be non-negative'),
  difficulty: z.string().min(1, 'Difficulty is required'),
  evidenceRequired: z.boolean().optional(),
  deadline: z.coerce.date({ invalid_type_error: 'Invalid deadline date' }),
  status: ChallengeStatusSchema.optional(),
});

const updateChallengeSchema = createChallengeSchema.partial().extend({
  description: z.string().nullable().optional(),
});

// ═══════════════════ CHALLENGE PARTICIPATION SCHEMAS ═══════════════════

const createChallengeParticipationSchema = z.object({
  challengeId: z.string().uuid('Invalid challenge ID'),
  employeeId: z.string().uuid('Invalid employee ID'),
  progress: z.number().int().min(0).max(100).optional(),
  proofUrl: z.string().url('Invalid proof URL').or(z.string().length(0)).nullable().optional(),
  approvalStatus: ApprovalStatusSchema.optional(),
  xpAwarded: z.number().int().nonnegative().optional(),
});

const updateChallengeParticipationSchema = createChallengeParticipationSchema.partial().extend({
  proofUrl: z.string().url('Invalid proof URL').or(z.string().length(0)).nullable().optional(),
});

// ═══════════════════ POLICY ACKNOWLEDGEMENT SCHEMAS ═══════════════════

const createPolicyAcknowledgementSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  policyId: z.string().uuid('Invalid policy ID'),
});

// ═══════════════════ AUDIT SCHEMAS ═══════════════════

const createAuditSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  date: z.coerce.date({ invalid_type_error: 'Invalid audit date' }),
  auditor: z.string().min(1, 'Auditor name is required'),
  status: z.string().optional(),
});

const updateAuditSchema = createAuditSchema.partial();

// ═══════════════════ COMPLIANCE ISSUE SCHEMAS ═══════════════════

const createComplianceIssueSchema = z.object({
  auditId: z.string().uuid('Invalid audit ID'),
  severity: ComplianceSeveritySchema,
  description: z.string().min(1, 'Issue description is required'),
  ownerId: z.string().uuid('Invalid owner ID'),
  dueDate: z.coerce.date({ invalid_type_error: 'Invalid due date' }),
  status: ComplianceStatusSchema.optional(),
});

const updateComplianceIssueSchema = createComplianceIssueSchema.partial();

// ═══════════════════ DEPARTMENT SCORE SCHEMAS ═══════════════════

const createDepartmentScoreSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  environmentalScore: z.number().finite().min(0).max(100),
  socialScore: z.number().finite().min(0).max(100),
  governanceScore: z.number().finite().min(0).max(100),
  totalScore: z.number().finite().min(0).max(100),
  period: z.string().regex(/^\d{4}-(?:Q[1-4]|\d{2})$/, 'Period must match YYYY-QQ or YYYY-MM format'),
});

const updateDepartmentScoreSchema = createDepartmentScoreSchema.partial();

module.exports = {
  createCarbonTransactionSchema,
  updateCarbonTransactionSchema,
  createCsrActivitySchema,
  updateCsrActivitySchema,
  createEmployeeParticipationSchema,
  updateEmployeeParticipationSchema,
  createChallengeSchema,
  updateChallengeSchema,
  createChallengeParticipationSchema,
  updateChallengeParticipationSchema,
  createPolicyAcknowledgementSchema,
  createAuditSchema,
  updateAuditSchema,
  createComplianceIssueSchema,
  updateComplianceIssueSchema,
  createDepartmentScoreSchema,
  updateDepartmentScoreSchema,
};
