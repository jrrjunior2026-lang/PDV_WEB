import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// FIX: Use a named import for PrismaClient and instantiate it directly.
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('adm123', saltRounds);
  const commonPassword = await bcrypt.hash('123456', saltRounds);

  // Create Users
  await prisma.user.upsert({
    where: { email: 'admin@pdv.com' },
    update: {
      password: adminPassword,
    },
    create: {
      name: 'Admin User',
      email: 'admin@pdv.com',
      password: adminPassword,
      role: 'Admin',
      status: 'Active',
    },
  });

  await prisma.user.upsert({
    where: { email: 'gerente@pdv.com' },
    update: {
       password: commonPassword,
    },
    create: {
      name: 'Gerente User',
      email: 'gerente@pdv.com',
      password: commonPassword,
      role: 'Gerente',
      status: 'Active',
    },
  });
  
  await prisma.user.upsert({
    where: { email: 'caixa@pdv.com' },
    update: {
       password: commonPassword,
    },
    create: {
      name: 'Caixa User',
      email: 'caixa@pdv.com',
      password: commonPassword,
      role: 'Caixa',
      status: 'Active',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    // FIX: Re-throw the error to ensure the .finally() block is executed,
    // allowing Prisma to disconnect gracefully.
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });