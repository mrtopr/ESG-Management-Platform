import axios from 'axios';

// Create base axios instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────── MOCK DATABASE SYSTEM ───────────────

const KEY_PREFIX = 'ecosphere_db_';

const getStorageItem = (key, defaultValue) => {
  const data = localStorage.getItem(KEY_PREFIX + key);
  if (!data) {
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setStorageItem = (key, value) => {
  localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
};

// Initial Seed Data
const defaultConfig = {
  id: 'cfg-1',
  orgId: 'default',
  envWeight: 0.4,
  socialWeight: 0.3,
  govWeight: 0.3,
  autoEmissionCalc: true,
  evidenceRequired: true,
  badgeAutoAward: true,
};

const defaultDepartments = [
  { id: 'dept-1', name: 'Engineering & IT', code: 'ENG', headId: 'emp-2', employeeCount: 3, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'dept-2', name: 'Marketing & Sales', code: 'MKT', headId: 'emp-4', employeeCount: 2, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'dept-3', name: 'Operations & Supply Chain', code: 'OPS', employeeCount: 1, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'dept-4', name: 'Legal & HR', code: 'LHR', employeeCount: 1, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const defaultEmployees = [
  { id: 'emp-1', name: 'Alice Smith', email: 'alice@company.com', role: 'ESG_ADMIN', departmentId: 'dept-4', xp: 450, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'emp-2', name: 'Bob Johnson', email: 'bob@company.com', role: 'DEPT_HEAD', departmentId: 'dept-1', xp: 600, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'emp-3', name: 'Charlie Brown', email: 'charlie@company.com', role: 'EMPLOYEE', departmentId: 'dept-1', xp: 200, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'emp-4', name: 'Diana Prince', email: 'diana@company.com', role: 'DEPT_HEAD', departmentId: 'dept-2', xp: 850, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'emp-5', name: 'Evan Wright', email: 'evan@company.com', role: 'EMPLOYEE', departmentId: 'dept-1', xp: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'emp-6', name: 'Fiona Gallagher', email: 'fiona@company.com', role: 'EMPLOYEE', departmentId: 'dept-3', xp: 120, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const defaultCategories = [
  { id: 'cat-1', name: 'Carbon Offsets & Reduction', type: 'CSR_ACTIVITY', status: 'active' },
  { id: 'cat-2', name: 'Community Volunteering', type: 'CSR_ACTIVITY', status: 'active' },
  { id: 'cat-3', name: 'Green Office & Commute', type: 'CHALLENGE', status: 'active' },
  { id: 'cat-4', name: 'Wellness & Inclusion', type: 'CHALLENGE', status: 'active' }
];

const defaultEmissionFactors = [
  { id: 'ef-1', activity: 'Grid Electricity (Average)', unit: 'kg CO2e / kWh', factorValue: 0.85 },
  { id: 'ef-2', activity: 'Diesel Generator Fuel', unit: 'kg CO2e / Litre', factorValue: 2.68 },
  { id: 'ef-3', activity: 'Aviation Flight (Domestic)', unit: 'kg CO2e / km', factorValue: 0.18 },
  { id: 'ef-4', activity: 'Corporate Office Waste (General)', unit: 'kg CO2e / kg', factorValue: 0.42 }
];

const defaultGoals = [
  { id: 'goal-1', title: 'Reduce Scope 1 & 2 Emissions', targetValue: 5000, currentValue: 3820, unit: 'kg CO2e', deadline: '2026-12-31', status: 'active' },
  { id: 'goal-2', title: '100% Transition to LED lighting', targetValue: 100, currentValue: 85, unit: '%', deadline: '2026-08-30', status: 'active' },
  { id: 'goal-3', title: 'Zero Waste to Landfill Initiative', targetValue: 0, currentValue: 120, unit: 'kg/month', deadline: '2026-10-15', status: 'active' }
];

const defaultPolicies = [
  { id: 'pol-1', title: 'Code of Environmental Conduct', content: 'This policy governs energy usage in office facilities, mandatory recycling, and sustainable sourcing rules.', version: 1 },
  { id: 'pol-2', title: 'Equal Opportunity and Diversity Policy', content: 'Our commitment to a diverse and inclusive environment where everyone is treated with absolute fairness.', version: 2 },
  { id: 'pol-3', title: 'Data Privacy and Integrity Governance', content: 'Rules and requirements surrounding client data protection, encryption standardizations, and audit readiness.', version: 1 }
];

const defaultBadges = [
  { id: 'bdg-1', name: 'Eco Starter', description: 'Awarded for completing your first carbon log or eco challenge.', unlockRule: { type: 'xp_threshold', value: 100 }, icon: 'Leaf' },
  { id: 'bdg-2', name: 'Sustainability Champion', description: 'Crossed 500 XP in active environmental actions.', unlockRule: { type: 'xp_threshold', value: 500 }, icon: 'Award' },
  { id: 'bdg-3', name: 'Community Pillar', description: 'Unlocks when the user reaches 1000 XP in CSR participations.', unlockRule: { type: 'xp_threshold', value: 1000 }, icon: 'Users' }
];

const defaultRewards = [
  { id: 'rwd-1', name: 'Reusable Bamboo Coffee Mug', description: 'Premium EcoSphere branded spill-proof mug.', pointsRequired: 150, stock: 8, status: 'active' },
  { id: 'rwd-2', name: 'National Park Day Pass', description: 'An outdoor excursion ticket to a national park of your choice.', pointsRequired: 300, stock: 15, status: 'active' },
  { id: 'rwd-3', name: 'Plant 10 Trees in Your Name', description: 'EcoSphere will fund the planting of 10 native trees in a reforestation reserve.', pointsRequired: 500, stock: 100, status: 'active' }
];

const defaultCarbonTransactions = [
  { id: 'ctx-1', departmentId: 'dept-1', emissionFactorId: 'ef-1', sourceType: 'Expense', sourceId: 'EXP-908', co2Amount: 850, date: '2026-07-01T10:00:00Z' },
  { id: 'ctx-2', departmentId: 'dept-3', emissionFactorId: 'ef-2', sourceType: 'Manufacturing', sourceId: 'MFG-211', co2Amount: 2680, date: '2026-07-03T14:30:00Z' },
  { id: 'ctx-3', departmentId: 'dept-2', emissionFactorId: 'ef-3', sourceType: 'Fleet', sourceId: 'FLT-004', co2Amount: 360, date: '2026-07-05T09:15:00Z' }
];

const defaultCsrActivities = [
  { id: 'csr-1', title: 'Local Beach Cleanup Drive', description: 'Volunteering activity to pick up plastic and waste from our coastal beach.', categoryId: 'cat-2', departmentId: 'dept-1', date: '2026-07-10' },
  { id: 'csr-2', title: 'E-Waste Recycling Drop-off', description: 'Collect and recycle old monitors, batteries, and hardware components.', categoryId: 'cat-1', departmentId: 'dept-1', date: '2026-07-15' }
];

const defaultParticipations = [
  { id: 'prt-1', employeeId: 'emp-3', activityId: 'csr-1', proofUrl: 'https://images.unsplash.com/photo-1595275313396-64010506b30a', approvalStatus: 'APPROVED', pointsEarned: 50, completionDate: '2026-07-10T12:00:00Z', createdAt: '2026-07-10T10:00:00Z' },
  { id: 'prt-2', employeeId: 'emp-2', activityId: 'csr-1', proofUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec', approvalStatus: 'PENDING', pointsEarned: 50, completionDate: null, createdAt: '2026-07-10T11:00:00Z' }
];

const defaultChallenges = [
  { id: 'chg-1', title: 'Bike or Walk to Work Challenge', categoryId: 'cat-3', description: 'Commute without fossil fuels for 5 consecutive days and submit a screenshot of your active tracker.', xp: 200, difficulty: 'Medium', evidenceRequired: true, deadline: '2026-07-20', status: 'ACTIVE' },
  { id: 'chg-2', title: 'Digital Clean-up & Energy Saver', categoryId: 'cat-3', description: 'Unsubscribe from junk mail, delete 10GB cloud storage, and configure sleep mode on active hardware.', xp: 100, difficulty: 'Easy', evidenceRequired: false, deadline: '2026-07-25', status: 'ACTIVE' }
];

const defaultChallengeParticipations = [
  { id: 'chp-1', challengeId: 'chg-1', employeeId: 'emp-4', progress: 100, proofUrl: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92', approvalStatus: 'APPROVED', xpAwarded: 200, createdAt: '2026-07-08T09:00:00Z' },
  { id: 'chp-2', challengeId: 'chg-1', employeeId: 'emp-3', progress: 40, proofUrl: null, approvalStatus: 'PENDING', xpAwarded: 0, createdAt: '2026-07-11T16:00:00Z' }
];

const defaultPolicyAcknowledgements = [
  { id: 'ack-1', employeeId: 'emp-1', policyId: 'pol-1', acknowledgedAt: '2026-07-01T09:00:00Z' },
  { id: 'ack-2', employeeId: 'emp-2', policyId: 'pol-1', acknowledgedAt: '2026-07-02T10:30:00Z' }
];

const defaultAudits = [
  { id: 'aud-1', departmentId: 'dept-1', date: '2026-07-02', auditor: 'Standard Veritas Group', status: 'completed' },
  { id: 'aud-2', departmentId: 'dept-3', date: '2026-07-28', auditor: 'Internal ESG Committee', status: 'scheduled' }
];

const defaultComplianceIssues = [
  { id: 'iss-1', auditId: 'aud-1', severity: 'MEDIUM', description: 'Missing chemical disposal logs in server/hardware clean labs.', ownerId: 'emp-2', dueDate: '2026-08-01', status: 'OPEN', createdAt: '2026-07-02T16:00:00Z' },
  { id: 'iss-2', auditId: 'aud-1', severity: 'HIGH', description: 'Unlabeled battery storage containers violating regional waste acts.', ownerId: 'emp-2', dueDate: '2026-07-05', status: 'OVERDUE', createdAt: '2026-07-02T16:00:00Z' }
];

const defaultDepartmentScores = [
  { id: 'score-1', departmentId: 'dept-1', environmentalScore: 82.5, socialScore: 78.0, governanceScore: 90.0, totalScore: 83.4, period: '2026-Q2', createdAt: '2026-07-01T00:00:00Z' },
  { id: 'score-2', departmentId: 'dept-2', environmentalScore: 68.0, socialScore: 85.0, governanceScore: 72.0, totalScore: 74.3, period: '2026-Q2', createdAt: '2026-07-01T00:00:00Z' }
];

const defaultPointsTransactions = [
  { id: 'tx-1', employeeId: 'emp-3', sourceType: 'CSR', sourceId: 'prt-1', amount: 50, createdAt: '2026-07-10T12:00:00Z' },
  { id: 'tx-2', employeeId: 'emp-4', sourceType: 'CHALLENGE', sourceId: 'chp-1', amount: 200, createdAt: '2026-07-08T09:00:00Z' }
];

const defaultRedemptions = [];
const defaultEmployeeBadges = [
  { id: 'eb-1', employeeId: 'emp-4', badgeId: 'bdg-1', awardedAt: '2026-07-08T09:00:00Z' },
  { id: 'eb-2', employeeId: 'emp-3', badgeId: 'bdg-1', awardedAt: '2026-07-10T12:00:00Z' }
];

// Helper to access / update db models
export const db = {
  get config() { return getStorageItem('config', defaultConfig); },
  set config(val) { setStorageItem('config', val); },

  get departments() { return getStorageItem('departments', defaultDepartments); },
  set departments(val) { setStorageItem('departments', val); },

  get employees() { return getStorageItem('employees', defaultEmployees); },
  set employees(val) { setStorageItem('employees', val); },

  get categories() { return getStorageItem('categories', defaultCategories); },
  set categories(val) { setStorageItem('categories', val); },

  get emissionFactors() { return getStorageItem('emissionFactors', defaultEmissionFactors); },
  set emissionFactors(val) { setStorageItem('emissionFactors', val); },

  get goals() { return getStorageItem('goals', defaultGoals); },
  set goals(val) { setStorageItem('goals', val); },

  get policies() { return getStorageItem('policies', defaultPolicies); },
  set policies(val) { setStorageItem('policies', val); },

  get badges() { return getStorageItem('badges', defaultBadges); },
  set badges(val) { setStorageItem('badges', val); },

  get rewards() { return getStorageItem('rewards', defaultRewards); },
  set rewards(val) { setStorageItem('rewards', val); },

  get carbonTransactions() { return getStorageItem('carbonTransactions', defaultCarbonTransactions); },
  set carbonTransactions(val) { setStorageItem('carbonTransactions', val); },

  get csrActivities() { return getStorageItem('csrActivities', defaultCsrActivities); },
  set csrActivities(val) { setStorageItem('csrActivities', val); },

  get participations() { return getStorageItem('participations', defaultParticipations); },
  set participations(val) { setStorageItem('participations', val); },

  get challenges() { return getStorageItem('challenges', defaultChallenges); },
  set challenges(val) { setStorageItem('challenges', val); },

  get challengeParticipations() { return getStorageItem('challengeParticipations', defaultChallengeParticipations); },
  set challengeParticipations(val) { setStorageItem('challengeParticipations', val); },

  get policyAcknowledgements() { return getStorageItem('policyAcknowledgements', defaultPolicyAcknowledgements); },
  set policyAcknowledgements(val) { setStorageItem('policyAcknowledgements', val); },

  get audits() { return getStorageItem('audits', defaultAudits); },
  set audits(val) { setStorageItem('audits', val); },

  get complianceIssues() { return getStorageItem('complianceIssues', defaultComplianceIssues); },
  set complianceIssues(val) { setStorageItem('complianceIssues', val); },

  get departmentScores() { return getStorageItem('departmentScores', defaultDepartmentScores); },
  set departmentScores(val) { setStorageItem('departmentScores', val); },

  get pointsTransactions() { return getStorageItem('pointsTransactions', defaultPointsTransactions); },
  set pointsTransactions(val) { setStorageItem('pointsTransactions', val); },

  get redemptions() { return getStorageItem('redemptions', defaultRedemptions); },
  set redemptions(val) { setStorageItem('redemptions', val); },

  get employeeBadges() { return getStorageItem('employeeBadges', defaultEmployeeBadges); },
  set employeeBadges(val) { setStorageItem('employeeBadges', val); }
};

// ─────────────── SIMULATE AXIOS INTERCEPTOR FOR LOCAL WORK ───────────────

const latency = () => new Promise(resolve => setTimeout(resolve, 300));

// Active Session state in memory
let currentUserId = localStorage.getItem('ecosphere_user_id') || 'emp-1';

export const setSessionUser = (userId) => {
  currentUserId = userId;
  localStorage.setItem('ecosphere_user_id', userId);
};

export const getSessionUser = () => {
  return db.employees.find(e => e.id === currentUserId) || db.employees[0];
};

// Helper for gamification triggers (XP updates)
export const addXPAndPoints = (employeeId, amount, type, sourceId) => {
  const employees = db.employees;
  const idx = employees.findIndex(e => e.id === employeeId);
  if (idx !== -1) {
    employees[idx].xp += amount;
    db.employees = employees;

    const txs = db.pointsTransactions;
    txs.push({
      id: `ptx-${Date.now()}`,
      employeeId,
      sourceType: type,
      sourceId,
      amount,
      createdAt: new Date().toISOString()
    });
    db.pointsTransactions = txs;

    checkBadgeUnlocks(employeeId);
  }
};

const checkBadgeUnlocks = (employeeId) => {
  if (!db.config.badgeAutoAward) return;
  
  const emp = db.employees.find(e => e.id === employeeId);
  if (!emp) return;

  const currentBadgeIds = db.employeeBadges
    .filter(eb => eb.employeeId === employeeId)
    .map(eb => eb.badgeId);

  const availableBadges = db.badges;

  availableBadges.forEach(badge => {
    if (currentBadgeIds.includes(badge.id)) return;

    let unlocked = false;
    if (badge.unlockRule.type === 'xp_threshold') {
      if (emp.xp >= badge.unlockRule.value) {
        unlocked = true;
      }
    }

    if (unlocked) {
      const ebs = db.employeeBadges;
      ebs.push({
        id: `eb-${Date.now()}-${badge.id}`,
        employeeId,
        badgeId: badge.id,
        awardedAt: new Date().toISOString()
      });
      db.employeeBadges = ebs;
    }
  });
};

// Simple mock handler structure to map API calls
export const mockHandlers = {
  // Auth
  login: async (email) => {
    await latency();
    const user = db.employees.find(e => e.email === email);
    if (!user) throw new Error('Invalid email or password');
    setSessionUser(user.id);
    return { token: 'mock-jwt-token', user };
  },

  getCurrentUser: async () => {
    await latency();
    const user = getSessionUser();
    const pts = db.pointsTransactions
      .filter(tx => tx.employeeId === user.id)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...user, points: pts };
  },

  // Environmental
  getEmissionFactors: async () => {
    await latency();
    return db.emissionFactors;
  },

  createEmissionFactor: async (data) => {
    await latency();
    const factors = db.emissionFactors;
    const newFactor = { ...data, id: `ef-${Date.now()}` };
    factors.push(newFactor);
    db.emissionFactors = factors;
    return newFactor;
  },

  getCarbonTransactions: async () => {
    await latency();
    const txs = db.carbonTransactions;
    const depts = db.departments;
    const factors = db.emissionFactors;
    return txs.map(tx => ({
      ...tx,
      department: depts.find(d => d.id === tx.departmentId),
      emissionFactor: factors.find(ef => ef.id === tx.emissionFactorId),
    }));
  },

  createCarbonTransaction: async (data) => {
    await latency();
    const factors = db.emissionFactors;
    const factor = factors.find(ef => ef.id === data.emissionFactorId);
    if (!factor) throw new Error('Emission factor not found');

    const quantity = 500; 
    const calculatedCo2 = quantity * factor.factorValue;

    const txs = db.carbonTransactions;
    const newTx = {
      ...data,
      id: `ctx-${Date.now()}`,
      co2Amount: Math.round(calculatedCo2 * 100) / 100,
      date: new Date().toISOString()
    };
    txs.push(newTx);
    db.carbonTransactions = txs;

    if (db.config.autoEmissionCalc) {
      const goals = db.goals;
      const primaryGoalIdx = goals.findIndex(g => g.id === 'goal-1');
      if (primaryGoalIdx !== -1) {
        goals[primaryGoalIdx].currentValue += Math.round(calculatedCo2 * 100) / 100;
        db.goals = goals;
      }
    }

    return newTx;
  },

  getGoals: async () => {
    await latency();
    return db.goals;
  },

  createGoal: async (data) => {
    await latency();
    const goals = db.goals;
    const newGoal = { ...data, id: `goal-${Date.now()}` };
    goals.push(newGoal);
    db.goals = goals;
    return newGoal;
  },

  // Social
  getCSRActivities: async () => {
    await latency();
    const acts = db.csrActivities;
    const cats = db.categories;
    const depts = db.departments;
    return acts.map(act => ({
      ...act,
      category: cats.find(c => c.id === act.categoryId),
      department: depts.find(d => d.id === act.departmentId)
    }));
  },

  createCSRActivity: async (data) => {
    await latency();
    const acts = db.csrActivities;
    const newAct = { ...data, id: `csr-${Date.now()}` };
    acts.push(newAct);
    db.csrActivities = acts;
    return newAct;
  },

  getParticipations: async () => {
    await latency();
    const prts = db.participations;
    const emps = db.employees;
    const acts = db.csrActivities;
    return prts.map(p => ({
      ...p,
      employee: emps.find(e => e.id === p.employeeId),
      activity: acts.find(a => a.id === p.activityId)
    }));
  },

  createParticipation: async (activityId, proofUrl) => {
    await latency();
    const currentUser = getSessionUser();
    const prts = db.participations;

    const exists = prts.find(p => p.employeeId === currentUser.id && p.activityId === activityId);
    if (exists) throw new Error('Already participated in this CSR activity');

    const newPrt = {
      id: `prt-${Date.now()}`,
      employeeId: currentUser.id,
      activityId,
      proofUrl,
      approvalStatus: 'PENDING',
      pointsEarned: 50,
      createdAt: new Date().toISOString()
    };
    prts.push(newPrt);
    db.participations = prts;
    return newPrt;
  },

  approveParticipation: async (id) => {
    await latency();
    const prts = db.participations;
    const idx = prts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Participation not found');

    prts[idx].approvalStatus = 'APPROVED';
    prts[idx].completionDate = new Date().toISOString();
    db.participations = prts;

    const p = prts[idx];
    addXPAndPoints(p.employeeId, p.pointsEarned, 'CSR', p.id);

    return prts[idx];
  },

  rejectParticipation: async (id) => {
    await latency();
    const prts = db.participations;
    const idx = prts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Participation not found');

    prts[idx].approvalStatus = 'REJECTED';
    db.participations = prts;
    return prts[idx];
  },

  // Governance
  getPolicies: async () => {
    await latency();
    const pols = db.policies;
    const acks = db.policyAcknowledgements;
    return pols.map(p => ({
      ...p,
      acknowledgements: acks.filter(a => a.policyId === p.id)
    }));
  },

  createPolicy: async (data) => {
    await latency();
    const pols = db.policies;
    const newPol = { ...data, id: `pol-${Date.now()}` };
    pols.push(newPol);
    db.policies = pols;
    return newPol;
  },

  acknowledgePolicy: async (id) => {
    await latency();
    const currentUser = getSessionUser();
    const acks = db.policyAcknowledgements;

    const exists = acks.find(a => a.employeeId === currentUser.id && a.policyId === id);
    if (exists) return exists;

    const newAck = {
      id: `ack-${Date.now()}`,
      employeeId: currentUser.id,
      policyId: id,
      acknowledgedAt: new Date().toISOString()
    };
    acks.push(newAck);
    db.policyAcknowledgements = acks;

    addXPAndPoints(currentUser.id, 20, 'ADJUSTMENT', newAck.id);

    return newAck;
  },

  getAudits: async () => {
    await latency();
    const auds = db.audits;
    const depts = db.departments;
    const issues = db.complianceIssues;
    return auds.map(a => ({
      ...a,
      department: depts.find(d => d.id === a.departmentId),
      issues: issues.filter(i => i.auditId === a.id)
    }));
  },

  createAudit: async (data) => {
    await latency();
    const auds = db.audits;
    const newAud = { ...data, id: `aud-${Date.now()}` };
    auds.push(newAud);
    db.audits = auds;
    return newAud;
  },

  getComplianceIssues: async () => {
    await latency();
    const issues = db.complianceIssues;
    const emps = db.employees;
    const auds = db.audits;
    return issues.map(i => ({
      ...i,
      owner: emps.find(e => e.id === i.ownerId),
      audit: auds.find(a => a.id === i.auditId)
    }));
  },

  createComplianceIssue: async (data) => {
    await latency();
    const issues = db.complianceIssues;
    const newIssue = {
      ...data,
      id: `iss-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    issues.push(newIssue);
    db.complianceIssues = issues;
    return newIssue;
  },

  updateComplianceIssueStatus: async (id, status) => {
    await latency();
    const issues = db.complianceIssues;
    const idx = issues.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Compliance issue not found');

    issues[idx].status = status;
    db.complianceIssues = issues;
    return issues[idx];
  },

  // Gamification
  getChallenges: async () => {
    await latency();
    const chs = db.challenges;
    const cats = db.categories;
    return chs.map(ch => ({
      ...ch,
      category: cats.find(c => c.id === ch.categoryId)
    }));
  },

  createChallenge: async (data) => {
    await latency();
    const chs = db.challenges;
    const newCh = { ...data, id: `chg-${Date.now()}` };
    chs.push(newCh);
    db.challenges = chs;
    return newCh;
  },

  getChallengeParticipations: async () => {
    await latency();
    const prts = db.challengeParticipations;
    const chs = db.challenges;
    const emps = db.employees;
    return prts.map(p => ({
      ...p,
      challenge: chs.find(c => c.id === p.challengeId),
      employee: emps.find(e => e.id === p.employeeId)
    }));
  },

  participateInChallenge: async (challengeId) => {
    await latency();
    const currentUser = getSessionUser();
    const prts = db.challengeParticipations;

    const exists = prts.find(p => p.employeeId === currentUser.id && p.challengeId === challengeId);
    if (exists) return exists;

    const newPrt = {
      id: `chp-${Date.now()}`,
      challengeId,
      employeeId: currentUser.id,
      progress: 0,
      proofUrl: null,
      approvalStatus: 'PENDING',
      xpAwarded: 0,
      createdAt: new Date().toISOString()
    };
    prts.push(newPrt);
    db.challengeParticipations = prts;
    return newPrt;
  },

  updateChallengeProgress: async (participationId, progress, proofUrl) => {
    await latency();
    const prts = db.challengeParticipations;
    const idx = prts.findIndex(p => p.id === participationId);
    if (idx === -1) throw new Error('Challenge participation not found');

    prts[idx].progress = progress;
    if (proofUrl) prts[idx].proofUrl = proofUrl;

    const chs = db.challenges;
    const ch = chs.find(c => c.id === prts[idx].challengeId);
    
    if (progress === 100) {
      if (ch && !ch.evidenceRequired) {
        prts[idx].approvalStatus = 'APPROVED';
        prts[idx].xpAwarded = ch.xp;
        
        addXPAndPoints(prts[idx].employeeId, ch.xp, 'CHALLENGE', prts[idx].id);
      } else {
        prts[idx].approvalStatus = 'PENDING';
      }
    }

    db.challengeParticipations = prts;
    return prts[idx];
  },

  approveChallengeParticipation: async (id) => {
    await latency();
    const prts = db.challengeParticipations;
    const idx = prts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Participation not found');

    prts[idx].approvalStatus = 'APPROVED';
    
    const chs = db.challenges;
    const ch = chs.find(c => c.id === prts[idx].challengeId);
    if (ch) {
      prts[idx].xpAwarded = ch.xp;
      addXPAndPoints(prts[idx].employeeId, ch.xp, 'CHALLENGE', prts[idx].id);
    }

    db.challengeParticipations = prts;
    return prts[idx];
  },

  rejectChallengeParticipation: async (id) => {
    await latency();
    const prts = db.challengeParticipations;
    const idx = prts.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Participation not found');

    prts[idx].approvalStatus = 'REJECTED';
    db.challengeParticipations = prts;
    return prts[idx];
  },

  getBadges: async () => {
    await latency();
    return db.badges;
  },

  getEmployeeBadges: async () => {
    await latency();
    const ebs = db.employeeBadges;
    const badges = db.badges;
    return ebs.map(eb => ({
      ...eb,
      badge: badges.find(b => b.id === eb.badgeId)
    }));
  },

  getLeaderboard: async () => {
    await latency();
    const emps = [...db.employees];
    const depts = db.departments;
    
    const sorted = emps.sort((a, b) => b.xp - a.xp);
    return sorted.map((emp, index) => ({
      id: emp.id,
      name: emp.name,
      xp: emp.xp,
      rank: index + 1,
      department: depts.find(d => d.id === emp.departmentId)?.name || 'Unknown'
    }));
  },

  getRewards: async () => {
    await latency();
    return db.rewards;
  },

  createReward: async (data) => {
    await latency();
    const rewards = db.rewards;
    const newReward = { ...data, id: `rwd-${Date.now()}` };
    rewards.push(newReward);
    db.rewards = rewards;
    return newReward;
  },

  redeemReward: async (id) => {
    await latency();
    const currentUser = getSessionUser();
    const rewards = db.rewards;
    const rIdx = rewards.findIndex(r => r.id === id);
    if (rIdx === -1) throw new Error('Reward not found');
    
    const reward = rewards[rIdx];
    if (reward.stock < 1) throw new Error('Reward is out of stock');

    const currentPoints = db.pointsTransactions
      .filter(tx => tx.employeeId === currentUser.id)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (currentPoints < reward.pointsRequired) {
      throw new Error(`Insufficient points balance. Need ${reward.pointsRequired}, but you only have ${currentPoints} points.`);
    }

    rewards[rIdx].stock -= 1;
    db.rewards = rewards;

    const redemptions = db.redemptions;
    const newRedemption = {
      id: `red-${Date.now()}`,
      employeeId: currentUser.id,
      rewardId: id,
      pointsSpent: reward.pointsRequired,
      createdAt: new Date().toISOString()
    };
    redemptions.push(newRedemption);
    db.redemptions = redemptions;

    const txs = db.pointsTransactions;
    txs.push({
      id: `ptx-${Date.now()}`,
      employeeId: currentUser.id,
      sourceType: 'REDEMPTION',
      sourceId: newRedemption.id,
      amount: -reward.pointsRequired,
      createdAt: new Date().toISOString()
    });
    db.pointsTransactions = txs;

    return newRedemption;
  },

  // Scoring
  getDepartmentScores: async () => {
    await latency();
    const scores = db.departmentScores;
    const depts = db.departments;
    return scores.map(s => ({
      ...s,
      department: depts.find(d => d.id === s.departmentId)
    }));
  },

  // Configuration and settings
  getConfig: async () => {
    await latency();
    return db.config;
  },

  updateConfig: async (data) => {
    await latency();
    const cfg = { ...db.config, ...data };
    db.config = cfg;
    return cfg;
  },

  getDepartments: async () => {
    await latency();
    return db.departments;
  },

  createDepartment: async (data) => {
    await latency();
    const depts = db.departments;
    const newDept = {
      ...data,
      id: `dept-${Date.now()}`,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    depts.push(newDept);
    db.departments = depts;
    return newDept;
  },

  getCategories: async () => {
    await latency();
    return db.categories;
  },

  createCategory: async (data) => {
    await latency();
    const cats = db.categories;
    const newCat = { ...data, id: `cat-${Date.now()}` };
    cats.push(newCat);
    db.categories = cats;
    return newCat;
  }
};
