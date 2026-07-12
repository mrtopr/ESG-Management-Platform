import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const dept = await prisma.department.create({ 
    data: { name: 'Engineering', code: 'ENG' } 
  });
  
  const employees = await Promise.all(
    Array.from({ length: 20 }).map(async (_, i) => 
      prisma.employee.create({
        data: { 
          name: `Employee ${i}`, 
          email: `emp${i}@eco.com`,
          passwordHash: await bcrypt.hash('pass123', 10), 
          departmentId: dept.id 
        },
      })
    )
  );
  
  console.log('Seeded 1 department and 20 employees.');
}

main().finally(async () => {
  await prisma.$disconnect();
});
