// ─────────────── ENUMS ───────────────
export type Role = 'EMPLOYEE' | 'DEPT_HEAD' | 'ESG_ADMIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ChallengeStatus = 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'COMPLETED' | 'ARCHIVED';
export type CategoryType = 'CSR_ACTIVITY' | 'CHALLENGE';
export type ComplianceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplianceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'OVERDUE';

// ─────────────── CORE DATA MODELS ───────────────

export interface Department {
  id: string;
  name: string;
  code: string;
  headId?: string | null;
  head?: Employee | null;
  parentId?: string | null;
  parent?: Department | null;
  children?: Department[];
  employeeCount: number;
  status: string;
  employees?: Employee[];
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  department?: Department;
  xp: number;
  points?: number; // Calculated points balance
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  status: string;
}

export interface EmissionFactor {
  id: string;
  activity: string; // e.g. "Diesel Fuel", "Electricity (grid)"
  unit: string;      // e.g. "kg CO2e / litre"
  factorValue: number;
}

export interface ProductEsgProfile {
  id: string;
  productId: string;
  carbonFootprint?: number | null;
  notes?: string | null;
}

export interface EnvironmentalGoal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: string; // "active" | "completed"
}

export interface EsgPolicy {
  id: string;
  title: string;
  content: string;
  version: number;
  acknowledgements?: PolicyAcknowledgement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlockRule: {
    type: 'xp_threshold' | 'csr_participation' | 'challenge_completed';
    value: number;
  };
  icon?: string | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  status: string; // "active" | "inactive"
}

// ─────────────── TRANSACTIONAL MODELS ───────────────

export interface CarbonTransaction {
  id: string;
  departmentId: string;
  department?: Department;
  emissionFactorId: string;
  emissionFactor?: EmissionFactor;
  sourceType: 'Purchase' | 'Manufacturing' | 'Expense' | 'Fleet';
  sourceId: string;
  co2Amount: number;
  date: string;
}

export interface CsrActivity {
  id: string;
  title: string;
  description?: string | null;
  categoryId: string;
  category?: Category;
  departmentId: string;
  department?: Department;
  date: string;
  participations?: EmployeeParticipation[];
}

export interface EmployeeParticipation {
  id: string;
  employeeId: string;
  employee?: Employee;
  activityId: string;
  activity?: CsrActivity;
  proofUrl?: string | null;
  approvalStatus: ApprovalStatus;
  pointsEarned: number;
  completionDate?: string | null;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  categoryId: string;
  category?: Category;
  description?: string | null;
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  evidenceRequired: boolean;
  deadline: string;
  status: ChallengeStatus;
  participations?: ChallengeParticipation[];
}

export interface ChallengeParticipation {
  id: string;
  challengeId: string;
  challenge?: Challenge;
  employeeId: string;
  employee?: Employee;
  progress: number; // 0 to 100
  proofUrl?: string | null;
  approvalStatus: ApprovalStatus;
  xpAwarded: number;
  createdAt: string;
}

export interface PolicyAcknowledgement {
  id: string;
  employeeId: string;
  employee?: Employee;
  policyId: string;
  policy?: EsgPolicy;
  acknowledgedAt: string;
}

export interface Audit {
  id: string;
  departmentId: string;
  department?: Department;
  date: string;
  auditor: string;
  status: string; // "scheduled" | "completed" | "in_progress"
  issues?: ComplianceIssue[];
}

export interface ComplianceIssue {
  id: string;
  auditId: string;
  audit?: Audit;
  severity: ComplianceSeverity;
  description: string;
  ownerId: string;
  owner?: Employee;
  dueDate: string;
  status: ComplianceStatus;
  createdAt: string;
}

export interface DepartmentScore {
  id: string;
  departmentId: string;
  department?: Department;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
  period: string; // e.g. "2026-Q3"
  createdAt: string;
}

// ─────────────── GAMIFICATION LEDGER ───────────────

export interface PointsTransaction {
  id: string;
  employeeId: string;
  employee?: Employee;
  sourceType: 'CSR' | 'CHALLENGE' | 'REDEMPTION' | 'ADJUSTMENT';
  sourceId?: string | null;
  amount: number;
  createdAt: string;
}

export interface Redemption {
  id: string;
  employeeId: string;
  employee?: Employee;
  rewardId: string;
  reward?: Reward;
  pointsSpent: number;
  createdAt: string;
}

export interface EmployeeBadge {
  id: string;
  employeeId: string;
  employee?: Employee;
  badgeId: string;
  badge?: Badge;
  awardedAt: string;
}

// ─────────────── CONFIGURATION ───────────────

export interface EsgConfig {
  id: string;
  orgId: string;
  envWeight: number;      // e.g. 0.4
  socialWeight: number;   // e.g. 0.3
  govWeight: number;      // e.g. 0.3
  autoEmissionCalc: boolean;
  evidenceRequired: boolean;
  badgeAutoAward: boolean;
}
