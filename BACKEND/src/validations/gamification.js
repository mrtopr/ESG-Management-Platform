import { z } from 'zod';
import { PointsSourceTypeSchema } from './enums.js';

// ═══════════════════ POINTS TRANSACTION SCHEMAS ═══════════════════

const createPointsTransactionSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  sourceType: PointsSourceTypeSchema,
  sourceId: z.string().nullable().optional(),
  amount: z.number().int('Amount must be an integer'), // can be positive (earned) or negative (spent/adjusted)
});

const updatePointsTransactionSchema = createPointsTransactionSchema.partial().extend({
  sourceId: z.string().nullable().optional(),
});

// ═══════════════════ REDEMPTION SCHEMAS ═══════════════════

const createRedemptionSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  rewardId: z.string().uuid('Invalid reward ID'),
  pointsSpent: z.number().int().positive('Points spent must be a positive integer'),
});

const updateRedemptionSchema = createRedemptionSchema.partial();

// ═══════════════════ EMPLOYEE BADGE SCHEMAS ═══════════════════

const createEmployeeBadgeSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  badgeId: z.string().uuid('Invalid badge ID'),
});

// ═══════════════════ ESG CONFIG SCHEMAS ═══════════════════

const esgConfigSchema = z.object({
  envWeight: z.number().finite().min(0).max(1).optional(),
  socialWeight: z.number().finite().min(0).max(1).optional(),
  govWeight: z.number().finite().min(0).max(1).optional(),
  autoEmissionCalc: z.boolean().optional(),
  evidenceRequired: z.boolean().optional(),
  badgeAutoAward: z.boolean().optional(),
}).refine(
  (data) => {
    // If weights are provided, their sum must equal 1.0 (approx)
    const env = data.envWeight !== undefined ? data.envWeight : 0.4;
    const social = data.socialWeight !== undefined ? data.socialWeight : 0.3;
    const gov = data.govWeight !== undefined ? data.govWeight : 0.3;
    const sum = env + social + gov;
    return Math.abs(sum - 1.0) < 0.001;
  },
  {
    message: 'The sum of envWeight, socialWeight, and govWeight must equal 1.0',
    path: ['envWeight'],
  }
);

export {
  createPointsTransactionSchema,
  updatePointsTransactionSchema,
  createRedemptionSchema,
  updateRedemptionSchema,
  createEmployeeBadgeSchema,
  esgConfigSchema,
};
