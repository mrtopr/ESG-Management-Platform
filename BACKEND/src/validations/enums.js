import { z } from 'zod';

// ═══════════════════ ENUMS VALIDATION SCHEMAS ═══════════════════

const RoleSchema = z.enum(['EMPLOYEE', 'DEPT_HEAD', 'ESG_ADMIN']);

const ApprovalStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

const ChallengeStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'UNDER_REVIEW',
  'COMPLETED',
  'ARCHIVED',
]);

const CategoryTypeSchema = z.enum(['CSR_ACTIVITY', 'CHALLENGE']);

const ComplianceSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const ComplianceStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'OVERDUE']);

const SourceTypeSchema = z.enum([
  'PURCHASE',
  'MANUFACTURING',
  'EXPENSE',
  'FLEET',
  'MANUAL',
]);

const PointsSourceTypeSchema = z.enum([
  'CSR',
  'CHALLENGE',
  'REDEMPTION',
  'ADJUSTMENT',
]);

export {
  RoleSchema,
  ApprovalStatusSchema,
  ChallengeStatusSchema,
  CategoryTypeSchema,
  ComplianceSeveritySchema,
  ComplianceStatusSchema,
  SourceTypeSchema,
  PointsSourceTypeSchema,
};
