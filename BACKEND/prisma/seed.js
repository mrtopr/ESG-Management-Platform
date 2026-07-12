import 'dotenv/config';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import prisma from '../src/config/db.js';

async function main() {
  console.log('Cleaning up existing data in correct dependency order...');

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
  await prisma.esgPolicy.deleteMany(); // fixed: model is esgPolicy
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
  await prisma.productEsgProfile.deleteMany();

  console.log('Seeding Global ESG Config...');
  const config = await prisma.esgConfig.create({
    data: {
      id: 'cfg-1',
      envWeight: 0.4,
      socialWeight: 0.3,
      govWeight: 0.3,
      autoEmissionCalc: true,
      evidenceRequired: true,
      badgeAutoAward: true,
    }
  });

  console.log('Seeding Departments...');
  const deptsData = [
    { id: 'dept-1', name: 'Engineering & IT', code: 'ENG' },
    { id: 'dept-2', name: 'Marketing & Sales', code: 'MKT' },
    { id: 'dept-3', name: 'Operations & Supply Chain', code: 'OPS' },
    { id: 'dept-4', name: 'Legal & HR', code: 'LHR' },
    { id: 'dept-5', name: 'Research & Development', code: 'RND' },
  ];
  const depts = [];
  for (const d of deptsData) {
    const dept = await prisma.department.create({ data: d });
    depts.push(dept);
  }

  console.log('Seeding Employees (~30 mock profiles)...');
  const passHash = await bcrypt.hash('password123', 10);
  const employees = [];

  // 1. ESG Admin
  const admin = await prisma.employee.create({
    data: {
      id: 'emp-admin',
      name: 'Sarah Jenkins',
      email: 'admin@ecosphere.com',
      role: 'ESG_ADMIN',
      departmentId: 'dept-4', // Legal & HR
      passwordHash: passHash,
      status: 'active',
    }
  });
  employees.push(admin);

  // 2. Department Heads
  const deptHeads = [
    { id: 'emp-head-eng', name: 'Marcus Brody', email: 'marcus.head@ecosphere.com', deptId: 'dept-1' },
    { id: 'emp-head-mkt', name: 'Sophia Loren', email: 'sophia.head@ecosphere.com', deptId: 'dept-2' },
    { id: 'emp-head-ops', name: 'John Miller', email: 'john.head@ecosphere.com', deptId: 'dept-3' },
    { id: 'emp-head-lhr', name: 'Sarah Jenkins', email: 'admin@ecosphere.com', deptId: 'dept-4', skipCreate: true }, // Admin is head of HR
    { id: 'emp-head-rnd', name: 'Elena Rostova', email: 'elena.head@ecosphere.com', deptId: 'dept-5' },
  ];

  for (const h of deptHeads) {
    if (h.skipCreate) {
      // Connect existing admin as head
      await prisma.department.update({ where: { id: h.deptId }, data: { headId: admin.id } });
      continue;
    }
    const head = await prisma.employee.create({
      data: {
        id: h.id,
        name: h.name,
        email: h.email,
        role: 'DEPT_HEAD',
        departmentId: h.deptId,
        passwordHash: passHash,
        status: 'active',
      }
    });
    employees.push(head);
    await prisma.department.update({ where: { id: h.deptId }, data: { headId: head.id } });
  }

  // 3. Standard Employees
  for (let i = 1; i <= 25; i++) {
    const dept = depts[Math.floor(Math.random() * depts.length)];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ecosphere.com`;

    const emp = await prisma.employee.create({
      data: {
        id: `emp-std-${i}`,
        name,
        email,
        role: 'EMPLOYEE',
        departmentId: dept.id,
        passwordHash: passHash,
        status: 'active',
      }
    });
    employees.push(emp);
  }

  // Update employee counts on departments
  for (const dept of depts) {
    const count = employees.filter(e => e.departmentId === dept.id).length;
    await prisma.department.update({
      where: { id: dept.id },
      data: { employeeCount: count }
    });
  }

  console.log('Seeding Categories...');
  const cat1 = await prisma.category.create({ data: { id: 'cat-1', name: 'Carbon Offsets & Reduction', type: 'CSR_ACTIVITY' } });
  const cat2 = await prisma.category.create({ data: { id: 'cat-2', name: 'Community Volunteering', type: 'CSR_ACTIVITY' } });
  const cat3 = await prisma.category.create({ data: { id: 'cat-3', name: 'Green Office & Commute', type: 'CHALLENGE' } });
  const cat4 = await prisma.category.create({ data: { id: 'cat-4', name: 'Waste & Circular Economy', type: 'CHALLENGE' } });

  console.log('Seeding Real-world Emission Factors (EPA/DEFRA values)...');
  const ef1 = await prisma.emissionFactor.create({ data: { id: 'ef-1', activity: 'Grid Electricity (Average)', unit: 'kg CO2e / kWh', factorValue: 0.385 } });
  const ef2 = await prisma.emissionFactor.create({ data: { id: 'ef-2', activity: 'Diesel Fuel (Generator/Fleet)', unit: 'kg CO2e / Litre', factorValue: 2.68 } });
  const ef3 = await prisma.emissionFactor.create({ data: { id: 'ef-3', activity: 'Domestic Economy Flight', unit: 'kg CO2e / km', factorValue: 0.15 } });
  const ef4 = await prisma.emissionFactor.create({ data: { id: 'ef-4', activity: 'General Office Waste (Landfill)', unit: 'kg CO2e / kg', factorValue: 0.45 } });
  const ef5 = await prisma.emissionFactor.create({ data: { id: 'ef-5', activity: 'Petrol/Gasoline Fleet Fuel', unit: 'kg CO2e / Litre', factorValue: 2.31 } });
  const efs = [ef1, ef2, ef3, ef4, ef5];

  console.log('Seeding Product ESG Profiles...');
  await prisma.productEsgProfile.create({ data: { productId: 'prod-101', carbonFootprint: 14.2, notes: 'Smart Thermostat. Main emissions stem from plastic shell moulding.' } });
  await prisma.productEsgProfile.create({ data: { productId: 'prod-102', carbonFootprint: 48.6, notes: 'GreenLink Mesh Office Chair. High recycled content.' } });
  await prisma.productEsgProfile.create({ data: { productId: 'prod-103', carbonFootprint: 8.5, notes: '10000mAh Solar Bank. Silicon cell carbon footprint accounted.' } });

  console.log('Seeding Environmental Goals...');
  await prisma.environmentalGoal.create({
    data: {
      id: 'goal-1',
      title: 'Reduce Scope 1 & 2 Emissions by 15%',
      targetValue: 30000,
      currentValue: 24500,
      unit: 'kg CO2e',
      periodStart: new Date('2026-01-01T00:00:00Z'),
      periodEnd: new Date('2026-12-31T23:59:59Z'),
      status: 'active'
    }
  });
  await prisma.environmentalGoal.create({
    data: {
      id: 'goal-2',
      title: 'Transition Operations Facility to 100% LED',
      departmentId: 'dept-3', // Operations
      targetValue: 100,
      currentValue: 80,
      unit: '%',
      periodStart: new Date('2026-01-01T00:00:00Z'),
      periodEnd: new Date('2026-08-31T23:59:59Z'),
      status: 'active'
    }
  });
  await prisma.environmentalGoal.create({
    data: {
      id: 'goal-3',
      title: 'Reduce Office General Waste Generation',
      targetValue: 500,
      currentValue: 620,
      unit: 'kg',
      periodStart: new Date('2026-01-01T00:00:00Z'),
      periodEnd: new Date('2026-10-31T23:59:59Z'),
      status: 'active'
    }
  });

  console.log('Seeding Policies...');
  const pol1 = await prisma.esgPolicy.create({ data: { id: 'pol-1', title: 'Code of Environmental Conduct', content: 'Guidelines on office heating limits, printing limits, recycling workflows, and commuting strategies.', version: 1 } });
  const pol2 = await prisma.esgPolicy.create({ data: { id: 'pol-2', title: 'Diversity & Inclusion Policy', content: 'Our commitment to parity in recruitment, pay structures, and physical access.', version: 2 } });
  const pol3 = await prisma.esgPolicy.create({ data: { id: 'pol-3', title: 'Responsible Data & Security Rules', content: 'Mandatory rules for client record security, clean lab access log files, and software auditing.', version: 1 } });

  console.log('Seeding Badges...');
  const bdg1 = await prisma.badge.create({ data: { id: 'bdg-1', name: 'Eco Starter', description: 'Crossed 100 XP in active environmental actions.', unlockRule: { type: 'xp_threshold', value: 100 }, icon: 'Leaf' } });
  const bdg2 = await prisma.badge.create({ data: { id: 'bdg-2', name: 'Sustainability Champion', description: 'Crossed 500 XP in environmental actions.', unlockRule: { type: 'xp_threshold', value: 500 }, icon: 'Award' } });
  const bdg3 = await prisma.badge.create({ data: { id: 'bdg-3', name: 'Community Pillar', description: 'Crossed 1000 XP in CSR/social activities.', unlockRule: { type: 'xp_threshold', value: 1000 }, icon: 'Users' } });

  console.log('Seeding Rewards...');
  await prisma.reward.create({ data: { id: 'rwd-1', name: 'Bamboo Insulated Coffee Mug', description: 'Double-walled steel interior, organic bamboo exterior.', pointsRequired: 150, stock: 12 } });
  await prisma.reward.create({ data: { id: 'rwd-2', name: 'State Park Annual Day Pass', description: 'Free parking and entry to any state park for one year.', pointsRequired: 300, stock: 20 } });
  await prisma.reward.create({ data: { id: 'rwd-3', name: ' Reforestation: Plant 10 Trees', description: '10 indigenous trees will be planted on your behalf in a protected reserve.', pointsRequired: 500, stock: 1000 } });
  await prisma.reward.create({ data: { id: 'rwd-4', name: 'Solar Phone Power Bank', description: 'Weatherproof 12000mAh solar charging pack.', pointsRequired: 400, stock: 8 } });

  console.log('Generating Carbon Transactions (~100 items over past 3 months)...');
  const sourceTypes = ['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'MANUAL'];
  for (let i = 0; i < 100; i++) {
    const dept = depts[Math.floor(Math.random() * depts.length)];
    const ef = efs[Math.floor(Math.random() * efs.length)];
    const quantity = parseFloat((Math.random() * 2000 + 10).toFixed(2));
    const co2Amount = parseFloat((quantity * ef.factorValue).toFixed(2));
    
    // Distribute transactions across the last 90 days
    const date = faker.date.recent({ days: 90 });

    await prisma.carbonTransaction.create({
      data: {
        id: `ctx-${i + 1}`,
        departmentId: dept.id,
        emissionFactorId: ef.id,
        sourceType: sourceTypes[Math.floor(Math.random() * sourceTypes.length)],
        sourceId: `SRC-${1000 + i}`,
        quantity,
        co2Amount,
        date,
      }
    });
  }

  console.log('Seeding CSR Activities & participations...');
  const csr1 = await prisma.csrActivity.create({
    data: {
      id: 'csr-1',
      title: 'Local Coastal Cleanup Volunteer Day',
      description: 'Volunteering drive at the southern beach to collect plastic waste and macroplastics.',
      categoryId: cat2.id,
      departmentId: 'dept-3', // Operations
      date: new Date('2026-07-01T09:00:00Z'),
      status: 'active',
    }
  });

  const csr2 = await prisma.csrActivity.create({
    data: {
      id: 'csr-2',
      title: 'Community Tree Planting Event',
      description: 'Planting local broadleaf saplings at the city reserve to increase green cover.',
      categoryId: cat1.id,
      departmentId: 'dept-1', // ENG
      date: new Date('2026-07-15T09:00:00Z'),
      status: 'active',
    }
  });

  const csr3 = await prisma.csrActivity.create({
    data: {
      id: 'csr-3',
      title: 'E-Waste Recycling Drop-off Campaign',
      description: 'Bringing in old electronics, server components, and screens for regional e-waste collection.',
      categoryId: cat1.id,
      departmentId: 'dept-1', // ENG
      date: new Date('2026-08-10T10:00:00Z'),
      status: 'active',
    }
  });

  // Assign random participations to CSR Activities
  const approvedEmpParticipations = [];
  const statusOptions = ['APPROVED', 'PENDING', 'REJECTED'];
  
  // Select a subset of employees for participations
  const testParticipatingEmployees = employees.slice(0, 15);
  for (const emp of testParticipatingEmployees) {
    // CSR 1 (Past)
    const status1 = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const points1 = status1 === 'APPROVED' ? 100 : 0;
    const p1 = await prisma.employeeParticipation.create({
      data: {
        employeeId: emp.id,
        activityId: csr1.id,
        proofUrl: status1 !== 'PENDING' ? 'https://images.unsplash.com/photo-1618477388954-7852f32655ec' : null,
        approvalStatus: status1,
        pointsEarned: points1,
        completionDate: status1 === 'APPROVED' ? new Date('2026-07-01T15:00:00Z') : null,
      }
    });
    if (status1 === 'APPROVED') approvedEmpParticipations.push({ empId: emp.id, points: 100, activityId: csr1.id, type: 'CSR', relId: p1.id });

    // CSR 2 (Recent)
    const status2 = statusOptions[Math.floor(Math.random() * 2)]; // approved or pending
    const points2 = status2 === 'APPROVED' ? 80 : 0;
    const p2 = await prisma.employeeParticipation.create({
      data: {
        employeeId: emp.id,
        activityId: csr2.id,
        proofUrl: status2 !== 'PENDING' ? 'https://images.unsplash.com/photo-1595275313396-64010506b30a' : null,
        approvalStatus: status2,
        pointsEarned: points2,
        completionDate: status2 === 'APPROVED' ? new Date('2026-07-15T15:00:00Z') : null,
      }
    });
    if (status2 === 'APPROVED') approvedEmpParticipations.push({ empId: emp.id, points: 80, activityId: csr2.id, type: 'CSR', relId: p2.id });
  }

  console.log('Seeding Challenges & participations...');
  const chg1 = await prisma.challenge.create({
    data: {
      id: 'chg-1',
      title: 'Active Green Commute Challenge',
      categoryId: cat3.id,
      description: 'Commute via cycling, walking, or carpooling for 5 days. Submit active tracker screenshot.',
      xp: 200,
      difficulty: 'Medium',
      evidenceRequired: true,
      deadline: new Date('2026-07-28T18:00:00Z'),
      status: 'ACTIVE',
    }
  });

  const chg2 = await prisma.challenge.create({
    data: {
      id: 'chg-2',
      title: 'Digital Footprint Optimization',
      categoryId: cat3.id,
      description: 'Clean out 20GB of unnecessary emails and cloud logs to decrease hosting energy footprint.',
      xp: 120,
      difficulty: 'Easy',
      evidenceRequired: false,
      deadline: new Date('2026-08-15T18:00:00Z'),
      status: 'ACTIVE',
    }
  });

  const chg3 = await prisma.challenge.create({
    data: {
      id: 'chg-3',
      title: 'Zero Waste Week Challenge',
      categoryId: cat4.id,
      description: 'Produce zero single-use plastics or packaging waste for a continuous 5-day cycle.',
      xp: 300,
      difficulty: 'Hard',
      evidenceRequired: true,
      deadline: new Date('2026-07-10T18:00:00Z'),
      status: 'COMPLETED',
    }
  });

  const approvedChallengeParticipations = [];
  // Challenge Participations for standard employees
  for (const emp of employees.slice(5, 20)) {
    // Challenge 1
    const pStatus1 = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    const xp1 = pStatus1 === 'APPROVED' ? 200 : 0;
    const cp1 = await prisma.challengeParticipation.create({
      data: {
        challengeId: chg1.id,
        employeeId: emp.id,
        progress: pStatus1 === 'APPROVED' ? 100 : Math.floor(Math.random() * 99),
        proofUrl: pStatus1 !== 'PENDING' ? 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92' : null,
        approvalStatus: pStatus1,
        xpAwarded: xp1,
      }
    });
    if (pStatus1 === 'APPROVED') approvedChallengeParticipations.push({ empId: emp.id, xp: 200, challengeId: chg1.id, type: 'CHALLENGE', relId: cp1.id });

    // Challenge 3 (Completed)
    const pStatus3 = statusOptions[Math.floor(Math.random() * 2)]; // Approved or Rejected
    const xp3 = pStatus3 === 'APPROVED' ? 300 : 0;
    const cp3 = await prisma.challengeParticipation.create({
      data: {
        challengeId: chg3.id,
        employeeId: emp.id,
        progress: pStatus3 === 'APPROVED' ? 100 : 20,
        proofUrl: pStatus3 === 'APPROVED' ? 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92' : null,
        approvalStatus: pStatus3,
        xpAwarded: xp3,
      }
    });
    if (pStatus3 === 'APPROVED') approvedChallengeParticipations.push({ empId: emp.id, xp: 300, challengeId: chg3.id, type: 'CHALLENGE', relId: cp3.id });
  }

  console.log('Seeding Policy Acknowledgements...');
  // All employees acknowledge the basic environment policy, some acknowledge others
  for (const emp of employees) {
    await prisma.policyAcknowledgement.create({
      data: {
        employeeId: emp.id,
        policyId: pol1.id,
        acknowledgedAt: faker.date.recent({ days: 30 }),
      }
    });

    if (Math.random() > 0.4) {
      await prisma.policyAcknowledgement.create({
        data: {
          employeeId: emp.id,
          policyId: pol2.id,
          acknowledgedAt: faker.date.recent({ days: 15 }),
        }
      });
    }

    if (emp.role === 'ESG_ADMIN' || emp.role === 'DEPT_HEAD') {
      await prisma.policyAcknowledgement.create({
        data: {
          employeeId: emp.id,
          policyId: pol3.id,
          acknowledgedAt: faker.date.recent({ days: 20 }),
        }
      });
    }
  }

  console.log('Seeding Audits & Compliance Issues...');
  const aud1 = await prisma.audit.create({ data: { id: 'aud-1', departmentId: 'dept-1', date: new Date('2026-06-15T00:00:00Z'), auditor: 'Standard Veritas Group', status: 'completed' } });
  const aud2 = await prisma.audit.create({ data: { id: 'aud-2', departmentId: 'dept-3', date: new Date('2026-07-02T00:00:00Z'), auditor: 'Internal ESG Committee', status: 'completed' } });
  const aud3 = await prisma.audit.create({ data: { id: 'aud-3', departmentId: 'dept-5', date: new Date('2026-08-20T00:00:00Z'), auditor: 'EcoSustain Auditing Agency', status: 'scheduled' } });

  // Compliance Issues for completed audits
  const issuesData = [
    { auditId: aud1.id, severity: 'MEDIUM', description: 'Missing chemical disposal logs in server/hardware clean labs.', ownerId: 'emp-head-eng', dueDate: new Date('2026-08-15'), status: 'OPEN' },
    { auditId: aud1.id, severity: 'HIGH', description: 'Unlabeled battery storage containers violating regional waste acts.', ownerId: 'emp-head-eng', dueDate: new Date('2026-07-01'), status: 'OVERDUE' },
    { auditId: aud2.id, severity: 'CRITICAL', description: 'Operations factory facility emissions exceeding daily thresholds in gas scrubbing stacks.', ownerId: 'emp-head-ops', dueDate: new Date('2026-07-15'), status: 'RESOLVED' },
    { auditId: aud2.id, severity: 'LOW', description: 'General office waste recycling bins lack clear classification symbols.', ownerId: 'emp-head-ops', dueDate: new Date('2026-08-30'), status: 'IN_PROGRESS' },
  ];
  for (let i = 0; i < issuesData.length; i++) {
    await prisma.complianceIssue.create({
      data: {
        id: `iss-${i + 1}`,
        ...issuesData[i]
      }
    });
  }

  console.log('Seeding Historical Department Scores (Q1, Q2, Q3)...');
  const quarters = ['2026-Q1', '2026-Q2', '2026-Q3'];
  for (const q of quarters) {
    for (const dept of depts) {
      const environmentalScore = parseFloat((Math.random() * 25 + 70).toFixed(1)); // 70.0 - 95.0
      const socialScore = parseFloat((Math.random() * 20 + 75).toFixed(1));        // 75.0 - 95.0
      const governanceScore = parseFloat((Math.random() * 15 + 80).toFixed(1));    // 80.0 - 95.0
      const totalScore = parseFloat(((environmentalScore + socialScore + governanceScore) / 3).toFixed(1));

      await prisma.departmentScore.create({
        data: {
          departmentId: dept.id,
          environmentalScore,
          socialScore,
          governanceScore,
          totalScore,
          period: q,
        }
      });
    }
  }

  console.log('Seeding Ledger Balances & Badges...');
  // Calculate total XP and compile points transactions for employees based on their seed events
  for (const emp of employees) {
    let totalXp = 0;
    
    // Add points from CSR
    const csrPrt = approvedEmpParticipations.filter(p => p.empId === emp.id);
    for (const p of csrPrt) {
      totalXp += p.points;
      await prisma.pointsTransaction.create({
        data: {
          employeeId: emp.id,
          sourceType: 'CSR',
          sourceId: p.relId,
          amount: p.points,
        }
      });
    }

    // Add points from Challenges
    const chgPrt = approvedChallengeParticipations.filter(c => c.empId === emp.id);
    for (const c of chgPrt) {
      totalXp += c.xp;
      await prisma.pointsTransaction.create({
        data: {
          employeeId: emp.id,
          sourceType: 'CHALLENGE',
          sourceId: c.relId,
          amount: c.xp,
        }
      });
    }

    // Add baseline adjustment points so everyone has some ledger history
    const baseline = Math.floor(Math.random() * 120 + 30);
    totalXp += baseline;
    await prisma.pointsTransaction.create({
      data: {
        employeeId: emp.id,
        sourceType: 'ADJUSTMENT',
        amount: baseline,
      }
    });

    // Generate badge awards if threshold is crossed
    if (totalXp >= 100) {
      await prisma.employeeBadge.create({
        data: {
          employeeId: emp.id,
          badgeId: bdg1.id,
          awardedAt: faker.date.recent({ days: 10 }),
        }
      });
    }
    if (totalXp >= 500) {
      await prisma.employeeBadge.create({
        data: {
          employeeId: emp.id,
          badgeId: bdg2.id,
          awardedAt: faker.date.recent({ days: 5 }),
        }
      });
    }

    // Generate standard redemptions for employees with points remaining
    if (totalXp > 200 && Math.random() > 0.5) {
      const redeemCost = 150;
      await prisma.redemption.create({
        data: {
          employeeId: emp.id,
          rewardId: 'rwd-1', // Bamboo coffee mug
          pointsSpent: redeemCost,
          createdAt: faker.date.recent({ days: 3 }),
        }
      });
      // Deduct from points ledger
      await prisma.pointsTransaction.create({
        data: {
          employeeId: emp.id,
          sourceType: 'REDEMPTION',
          amount: -redeemCost,
        }
      });
    }
  }

  console.log('\n🚀 Database seeding complete! Successfully populated all tables with high-fidelity datasets.');
}

main()
  .catch((e) => {
    console.error('Fatal Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
