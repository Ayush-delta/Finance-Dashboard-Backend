const prisma = require('./client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create one user per role
  const admin = await prisma.user.create({
    data: {
      email: 'admin@finance.dev',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@finance.dev',
      name: 'Analyst User',
      password: hashedPassword,
      role: 'ANALYST',
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@finance.dev',
      name: 'Viewer User',
      password: hashedPassword,
      role: 'VIEWER',
    },
  });

  // Seed financial records
  const categories = ['Salary', 'Rent', 'Groceries', 'Utilities', 'Freelance', 'Investment', 'Entertainment', 'Transport'];
  const records = [];

  // Build 6 months of sample data
  for (let month = 0; month < 6; month++) {
    const date = new Date();
    date.setMonth(date.getMonth() - month);

    records.push({
      amount: 5000 + Math.random() * 2000,
      type: 'INCOME',
      category: 'Salary',
      date: new Date(date.getFullYear(), date.getMonth(), 1),
      description: 'Monthly salary',
      createdById: admin.id,
    });

    records.push({
      amount: 800 + Math.random() * 200,
      type: 'INCOME',
      category: 'Freelance',
      date: new Date(date.getFullYear(), date.getMonth(), 10),
      description: 'Freelance project payment',
      createdById: analyst.id,
    });

    records.push({
      amount: 1500,
      type: 'EXPENSE',
      category: 'Rent',
      date: new Date(date.getFullYear(), date.getMonth(), 5),
      description: 'Monthly rent',
      createdById: admin.id,
    });

    records.push({
      amount: 200 + Math.random() * 100,
      type: 'EXPENSE',
      category: 'Groceries',
      date: new Date(date.getFullYear(), date.getMonth(), 15),
      description: 'Monthly groceries',
      createdById: admin.id,
    });

    records.push({
      amount: 80 + Math.random() * 40,
      type: 'EXPENSE',
      category: 'Utilities',
      date: new Date(date.getFullYear(), date.getMonth(), 20),
      description: 'Electricity and water',
      createdById: analyst.id,
    });

    records.push({
      amount: 50 + Math.random() * 100,
      type: 'EXPENSE',
      category: 'Entertainment',
      date: new Date(date.getFullYear(), date.getMonth(), 25),
      description: 'Weekend outing',
      createdById: analyst.id,
    });
  }

  await prisma.financialRecord.createMany({ data: records });

  console.log('Seed complete!');
  console.log('\n Demo credentials (all passwords: password123)');
  console.log('  admin@finance.dev    → ADMIN');
  console.log('  analyst@finance.dev  → ANALYST');
  console.log('  viewer@finance.dev   → VIEWER');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
