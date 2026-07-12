import { z } from 'zod';
import { RoleSchema, CategoryTypeSchema } from './enums.js';

// ═══════════════════ DEPARTMENT SCHEMAS ═══════════════════

const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
  headId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  status: z.string().optional(),
});

const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  headId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

// ═══════════════════ EMPLOYEE SCHEMAS ═══════════════════

const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  passwordHash: z.string().min(6, 'Password hash must be at least 6 characters'),
  role: RoleSchema.optional(),
  departmentId: z.string().uuid('Invalid department ID'),
  status: z.string().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

// ═══════════════════ CATEGORY SCHEMAS ═══════════════════

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: CategoryTypeSchema,
  status: z.string().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// ═══════════════════ EMISSION FACTOR SCHEMAS ═══════════════════

const createEmissionFactorSchema = z.object({
  activity: z.string().min(1, 'Activity description is required'),
  unit: z.string().min(1, 'Unit is required'),
  factorValue: z.number().nonnegative('Factor value must be a non-negative number'),
  status: z.string().optional(),
});

const updateEmissionFactorSchema = createEmissionFactorSchema.partial();

// ═══════════════════ PRODUCT ESG PROFILE SCHEMAS ═══════════════════

const createProductEsgProfileSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  carbonFootprint: z.number().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const updateProductEsgProfileSchema = createProductEsgProfileSchema.partial().extend({
  carbonFootprint: z.number().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ═══════════════════ ENVIRONMENTAL GOAL SCHEMAS ═══════════════════

const environmentalGoalBaseSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  departmentId: z.string().uuid('Invalid department ID').nullable().optional(),
  targetValue: z.number().finite('Target value must be a valid number'),
  currentValue: z.number().finite().optional(),
  unit: z.string().min(1, 'Unit is required'),
  periodStart: z.coerce.date({ invalid_type_error: 'Invalid start date' }),
  periodEnd: z.coerce.date({ invalid_type_error: 'Invalid end date' }),
  status: z.string().optional(),
});

const createEnvironmentalGoalSchema = environmentalGoalBaseSchema.refine(
  (data) => data.periodEnd >= data.periodStart,
  {
    message: 'Period end date must be after or equal to period start date',
    path: ['periodEnd'],
  }
);

const updateEnvironmentalGoalSchema = environmentalGoalBaseSchema.partial().refine(
  (data) => {
    if (data.periodStart && data.periodEnd) {
      return data.periodEnd >= data.periodStart;
    }
    return true;
  },
  {
    message: 'Period end date must be after or equal to period start date',
    path: ['periodEnd'],
  }
);

// ═══════════════════ ESG POLICY SCHEMAS ═══════════════════

const createEsgPolicySchema = z.object({
  title: z.string().min(1, 'Policy title is required'),
  content: z.string().min(1, 'Policy content is required'),
  version: z.number().int().positive().optional(),
  status: z.string().optional(),
});

const updateEsgPolicySchema = createEsgPolicySchema.partial();

// ═══════════════════ BADGE SCHEMAS ═══════════════════

const createBadgeSchema = z.object({
  name: z.string().min(1, 'Badge name is required'),
  description: z.string().min(1, 'Badge description is required'),
  unlockRule: z.record(z.any(), { message: 'Unlock rule must be a valid JSON object' }),
  icon: z.string().nullable().optional(),
});

const updateBadgeSchema = createBadgeSchema.partial().extend({
  icon: z.string().nullable().optional(),
});

// ═══════════════════ REWARD SCHEMAS ═══════════════════

const createRewardSchema = z.object({
  name: z.string().min(1, 'Reward name is required'),
  description: z.string().min(1, 'Reward description is required'),
  pointsRequired: z.number().int().positive('Points required must be a positive integer'),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
  status: z.string().optional(),
});

const updateRewardSchema = createRewardSchema.partial();

export {
  createDepartmentSchema,
  updateDepartmentSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  createCategorySchema,
  updateCategorySchema,
  createEmissionFactorSchema,
  updateEmissionFactorSchema,
  createProductEsgProfileSchema,
  updateProductEsgProfileSchema,
  createEnvironmentalGoalSchema,
  updateEnvironmentalGoalSchema,
  createEsgPolicySchema,
  updateEsgPolicySchema,
  createBadgeSchema,
  updateBadgeSchema,
  createRewardSchema,
  updateRewardSchema,
};
