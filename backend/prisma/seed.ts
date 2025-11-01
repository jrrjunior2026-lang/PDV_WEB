import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
    // FIX: By re-throwing the error, the process will exit with a non-zero status code,
    // and the `finally` block will still execute to disconnect Prisma.
    // Using process.exit() could prevent the finally block from running.
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });