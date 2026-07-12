import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing data...');
  
  // Clean in correct dependency order
  await prisma.pointsTransaction.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.employeeBadge.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.complianceIssue.deleteMany();
  await prisma.challengeParticipation.deleteMany();
  await prisma.employeeParticipation.deleteMany();
  
  await prisma.employee.deleteMany();
  await prisma.departmentScore.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.environmentalGoal.deleteMany();
  await prisma.carbonTransaction.deleteMany();
  await prisma.csrActivity.deleteMany();
  await prisma.challenge.deleteMany();
  
  await prisma.department.deleteMany();
  await prisma.category.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.esgConfig.deleteMany();

  console.log('Seeding Master Data...');

  // 1. ESG Config
  const config = await prisma.esgConfig.create({
    data: {
      id: 'cfg-1',
      orgId: 'default',
      envWeight: 0.4,
      socialWeight: 0.3,
      govWeight: 0.3,
      autoEmissionCalc: true,
      evidenceRequired: true,
      badgeAutoAward: true,
    }
  });

  // 2. Departments
  const dept1 = await prisma.department.create({ data: { id: 'dept-1', name: 'Engineering & IT', code: 'ENG' } });
  const dept2 = await prisma.department.create({ data: { id: 'dept-2', name: 'Marketing & Sales', code: 'MKT' } });
  const dept3 = await prisma.department.create({ data: { id: 'dept-3', name: 'Operations & Supply Chain', code: 'OPS' } });
  const dept4 = await prisma.department.create({ data: { id: 'dept-4', name: 'Legal & HR', code: 'LHR' } });

  // 3. Employees
  const passHash = await bcrypt.hash('pass123', 10);
  const emp1 = await prisma.employee.create({ data: { id: 'emp-1', name: 'Alice Smith', email: 'alice@company.com', role: 'ESG_ADMIN', departmentId: dept4.id, passwordHash: passHash } });
  const emp2 = await prisma.employee.create({ data: { id: 'emp-2', name: 'Bob Johnson', email: 'bob@company.com', role: 'DEPT_HEAD', departmentId: dept1.id, passwordHash: passHash } });
  const emp3 = await prisma.employee.create({ data: { id: 'emp-3', name: 'Charlie Brown', email: 'charlie@company.com', role: 'EMPLOYEE', departmentId: dept1.id, passwordHash: passHash } });
  const emp4 = await prisma.employee.create({ data: { id: 'emp-4', name: 'Diana Prince', email: 'diana@company.com', role: 'DEPT_HEAD', departmentId: dept2.id, passwordHash: passHash } });
  const emp5 = await prisma.employee.create({ data: { id: 'emp-5', name: 'Evan Wright', email: 'evan@company.com', role: 'EMPLOYEE', departmentId: dept1.id, passwordHash: passHash } });
  const emp6 = await prisma.employee.create({ data: { id: 'emp-6', name: 'Fiona Gallagher', email: 'fiona@company.com', role: 'EMPLOYEE', departmentId: dept3.id, passwordHash: passHash } });

  // Update department heads
  await prisma.department.update({ where: { id: dept1.id }, data: { headId: emp2.id } });
  await prisma.department.update({ where: { id: dept2.id }, data: { headId: emp4.id } });
  await prisma.department.update({ where: { id: dept4.id }, data: { headId: emp1.id } });

  // 4. Categories
  const cat1 = await prisma.category.create({ data: { id: 'cat-1', name: 'Carbon Offsets & Reduction', type: 'CSR_ACTIVITY' } });
  const cat2 = await prisma.category.create({ data: { id: 'cat-2', name: 'Community Volunteering', type: 'CSR_ACTIVITY' } });
  const cat3 = await prisma.category.create({ data: { id: 'cat-3', name: 'Green Office & Commute', type: 'CHALLENGE' } });
  const cat4 = await prisma.category.create({ data: { id: 'cat-4', name: 'Wellness & Inclusion', type: 'CHALLENGE' } });

  // 5. Emission Factors
  const ef1 = await prisma.emissionFactor.create({ data: { id: 'ef-1', activity: 'Grid Electricity (Average)', unit: 'kg CO2e / kWh', factorValue: 0.85 } });
  const ef2 = await prisma.emissionFactor.create({ data: { id: 'ef-2', activity: 'Diesel Generator Fuel', unit: 'kg CO2e / Litre', factorValue: 2.68 } });
  const ef3 = await prisma.emissionFactor.create({ data: { id: 'ef-3', activity: 'Aviation Flight (Domestic)', unit: 'kg CO2e / km', factorValue: 0.18 } });
  const ef4 = await prisma.emissionFactor.create({ data: { id: 'ef-4', activity: 'Corporate Office Waste (General)', unit: 'kg CO2e / kg', factorValue: 0.42 } });

  // 6. Goals
  await prisma.environmentalGoal.create({ data: { id: 'goal-1', title: 'Reduce Scope 1 & 2 Emissions', targetValue: 5000, currentValue: 3820, unit: 'kg CO2e', deadline: new Date('2026-12-31') } });
  await prisma.environmentalGoal.create({ data: { id: 'goal-2', title: '100% Transition to LED lighting', targetValue: 100, currentValue: 85, unit: '%', deadline: new Date('2026-08-30') } });
  await prisma.environmentalGoal.create({ data: { id: 'goal-3', title: 'Zero Waste to Landfill Initiative', targetValue: 0, currentValue: 120, unit: 'kg/month', deadline: new Date('2026-10-15') } });

  // 7. Policies
  const pol1 = await prisma.policy.create({ data: { id: 'pol-1', title: 'Code of Environmental Conduct', content: 'This policy governs energy usage in office facilities, mandatory recycling, and sustainable sourcing rules.', version: 1 } });
  const pol2 = await prisma.policy.create({ data: { id: 'pol-2', title: 'Equal Opportunity and Diversity Policy', content: 'Our commitment to a diverse and inclusive environment where everyone is treated with absolute fairness.', version: 2 } });
  const pol3 = await prisma.policy.create({ data: { id: 'pol-3', title: 'Data Privacy and Integrity Governance', content: 'Rules and requirements surrounding client data protection, encryption standardizations, and audit readiness.', version: 1 } });

  // 8. Badges
  const bdg1 = await prisma.badge.create({ data: { id: 'bdg-1', name: 'Eco Starter', description: 'Awarded for completing your first carbon log or eco challenge.', unlockRule: { type: 'xp_threshold', value: 100 }, icon: 'Leaf' } });
  const bdg2 = await prisma.badge.create({ data: { id: 'bdg-2', name: 'Sustainability Champion', description: 'Crossed 500 XP in active environmental actions.', unlockRule: { type: 'xp_threshold', value: 500 }, icon: 'Award' } });
  const bdg3 = await prisma.badge.create({ data: { id: 'bdg-3', name: 'Community Pillar', description: 'Unlocks when the user reaches 1000 XP in CSR participations.', unlockRule: { type: 'xp_threshold', value: 1000 }, icon: 'Users' } });

  // 9. Rewards
  await prisma.reward.create({ data: { id: 'rwd-1', name: 'Reusable Bamboo Coffee Mug', description: 'Premium EcoSphere branded spill-proof mug.', pointsRequired: 150, stock: 8 } });
  await prisma.reward.create({ data: { id: 'rwd-2', name: 'National Park Day Pass', description: 'An outdoor excursion ticket to a national park of your choice.', pointsRequired: 300, stock: 15 } });
  await prisma.reward.create({ data: { id: 'rwd-3', name: 'Plant 10 Trees in Your Name', description: 'EcoSphere will fund the planting of 10 native trees in a reforestation reserve.', pointsRequired: 500, stock: 100 } });

  console.log('Seeding Activities and Transactions...');

  // 10. Carbon Transactions
  await prisma.carbonTransaction.create({ data: { id: 'ctx-1', departmentId: dept1.id, emissionFactorId: ef1.id, sourceType: 'EXPENSE', sourceId: 'EXP-908', co2Amount: 850, date: new Date('2026-07-01T10:00:00Z') } });
  await prisma.carbonTransaction.create({ data: { id: 'ctx-2', departmentId: dept3.id, emissionFactorId: ef2.id, sourceType: 'MANUFACTURING', sourceId: 'MFG-211', co2Amount: 2680, date: new Date('2026-07-03T14:30:00Z') } });
  await prisma.carbonTransaction.create({ data: { id: 'ctx-3', departmentId: dept2.id, emissionFactorId: ef3.id, sourceType: 'FLEET', sourceId: 'FLT-004', co2Amount: 360, date: new Date('2026-07-05T09:15:00Z') } });

  // 11. CSR Activities
  const csr1 = await prisma.csrActivity.create({ data: { id: 'csr-1', title: 'Local Beach Cleanup Drive', description: 'Volunteering activity to pick up plastic and waste from our coastal beach.', categoryId: cat2.id, departmentId: dept1.id, date: new Date('2026-07-10') } });
  const csr2 = await prisma.csrActivity.create({ data: { id: 'csr-2', title: 'E-Waste Recycling Drop-off', description: 'Collect and recycle old monitors, batteries, and hardware components.', categoryId: cat1.id, departmentId: dept1.id, date: new Date('2026-07-15') } });

  // 12. Employee CSR Participations
  const prt1 = await prisma.employeeParticipation.create({ data: { id: 'prt-1', employeeId: emp3.id, activityId: csr1.id, proofUrl: 'https://images.unsplash.com/photo-1595275313396-64010506b30a', approvalStatus: 'APPROVED', pointsEarned: 50, completionDate: new Date('2026-07-10T12:00:00Z'), createdAt: new Date('2026-07-10T10:00:00Z') } });
  const prt2 = await prisma.employeeParticipation.create({ data: { id: 'prt-2', employeeId: emp2.id, activityId: csr1.id, proofUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec', approvalStatus: 'PENDING', pointsEarned: 50, createdAt: new Date('2026-07-10T11:00:00Z') } });

  // 13. Challenges
  const chg1 = await prisma.challenge.create({ data: { id: 'chg-1', title: 'Bike or Walk to Work Challenge', categoryId: cat3.id, description: 'Commute without fossil fuels for 5 consecutive days and submit a screenshot of your active tracker.', xp: 200, difficulty: 'Medium', evidenceRequired: true, deadline: new Date('2026-07-20'), status: 'ACTIVE' } });
  const chg2 = await prisma.challenge.create({ data: { id: 'chg-2', title: 'Digital Clean-up & Energy Saver', categoryId: cat3.id, description: 'Unsubscribe from junk mail, delete 10GB cloud storage, and configure sleep mode on active hardware.', xp: 100, difficulty: 'Easy', evidenceRequired: false, deadline: new Date('2026-07-25'), status: 'ACTIVE' } });

  // 14. Challenge Participations
  const chp1 = await prisma.challengeParticipation.create({ data: { id: 'chp-1', challengeId: chg1.id, employeeId: emp4.id, progress: 100, proofUrl: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92', approvalStatus: 'APPROVED', xpAwarded: 200, createdAt: new Date('2026-07-08T09:00:00Z') } });
  const chp2 = await prisma.challengeParticipation.create({ data: { id: 'chp-2', challengeId: chg1.id, employeeId: emp3.id, progress: 40, approvalStatus: 'PENDING', xpAwarded: 0, createdAt: new Date('2026-07-11T16:00:00Z') } });

  // 15. Policy Acknowledgements
  await prisma.policyAcknowledgement.create({ data: { id: 'ack-1', employeeId: emp1.id, policyId: pol1.id, acknowledgedAt: new Date('2026-07-01T09:00:00Z') } });
  await prisma.policyAcknowledgement.create({ data: { id: 'ack-2', employeeId: emp2.id, policyId: pol1.id, acknowledgedAt: new Date('2026-07-02T10:30:00Z') } });

  // 16. Audits
  const aud1 = await prisma.audit.create({ data: { id: 'aud-1', departmentId: dept1.id, date: new Date('2026-07-02'), auditor: 'Standard Veritas Group', status: 'completed' } });
  const aud2 = await prisma.audit.create({ data: { id: 'aud-2', departmentId: dept3.id, date: new Date('2026-07-28'), auditor: 'Internal ESG Committee', status: 'scheduled' } });

  // 17. Compliance Issues
  await prisma.complianceIssue.create({ data: { id: 'iss-1', auditId: aud1.id, severity: 'MEDIUM', description: 'Missing chemical disposal logs in server/hardware clean labs.', ownerId: emp2.id, dueDate: new Date('2026-08-01'), status: 'OPEN', createdAt: new Date('2026-07-02T16:00:00Z') } });
  await prisma.complianceIssue.create({ data: { id: 'iss-2', auditId: aud1.id, severity: 'HIGH', description: 'Unlabeled battery storage containers violating regional waste acts.', ownerId: emp2.id, dueDate: new Date('2026-07-05'), status: 'OVERDUE', createdAt: new Date('2026-07-02T16:00:00Z') } });

  // 18. Department Scores
  await prisma.departmentScore.create({ data: { id: 'score-1', departmentId: dept1.id, environmentalScore: 82.5, socialScore: 78.0, governanceScore: 90.0, totalScore: 83.4, period: '2026-Q2', createdAt: new Date('2026-07-01T00:00:00Z') } });
  await prisma.departmentScore.create({ data: { id: 'score-2', departmentId: dept2.id, environmentalScore: 68.0, socialScore: 85.0, governanceScore: 72.0, totalScore: 74.3, period: '2026-Q2', createdAt: new Date('2026-07-01T00:00:00Z') } });

  // 19. Points Transactions (initial seeds matching employee XPs)
  // Alice: 450 XP (e.g. CSR: 50, Challenge: 200, Policy Acks: 200)
  await prisma.pointsTransaction.create({ data: { id: 'tx-1-alice', employeeId: emp1.id, sourceType: 'ADJUSTMENT', amount: 450 } });
  // Bob: 600 XP
  await prisma.pointsTransaction.create({ data: { id: 'tx-2-bob', employeeId: emp2.id, sourceType: 'ADJUSTMENT', amount: 600 } });
  // Charlie: 200 XP
  await prisma.pointsTransaction.create({ data: { id: 'tx-1-charlie', employeeId: emp3.id, sourceType: 'CSR', sourceId: prt1.id, amount: 50, createdAt: new Date('2026-07-10T12:00:00Z') } });
  await prisma.pointsTransaction.create({ data: { id: 'tx-2-charlie', employeeId: emp3.id, sourceType: 'ADJUSTMENT', amount: 150 } });
  // Diana: 850 XP
  await prisma.pointsTransaction.create({ data: { id: 'tx-1-diana', employeeId: emp4.id, sourceType: 'CHALLENGE', sourceId: chp1.id, amount: 200, createdAt: new Date('2026-07-08T09:00:00Z') } });
  await prisma.pointsTransaction.create({ data: { id: 'tx-2-diana', employeeId: emp4.id, sourceType: 'ADJUSTMENT', amount: 650 } });
  // Evan: 50 XP
  await prisma.pointsTransaction.create({ data: { id: 'tx-1-evan', employeeId: emp5.id, sourceType: 'ADJUSTMENT', amount: 50 } });
  // Fiona: 120 XP
  await prisma.pointsTransaction.create({ data: { id: 'tx-1-fiona', employeeId: emp6.id, sourceType: 'ADJUSTMENT', amount: 120 } });

  // 20. Employee Badges
  await prisma.employeeBadge.create({ data: { id: 'eb-1', employeeId: emp4.id, badgeId: bdg1.id, awardedAt: new Date('2026-07-08T09:00:00Z') } });
  await prisma.employeeBadge.create({ data: { id: 'eb-2', employeeId: emp3.id, badgeId: bdg1.id, awardedAt: new Date('2026-07-10T12:00:00Z') } });

  console.log('Database successfully seeded with standard mock datasets!');
}

main()
  .catch((e) => {
    console.error('Error during seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
