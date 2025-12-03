// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const defaultCategories = [
  'Productivity',
  'Design',
  'Engineering',
  'Personal Growth',
  'Career',
  'Motivation',
  'Family Affair',
  'Spiritual',
  'Study',
  'Uncategorized',
];

async function main() {
  console.log('🌱 Seeding default categories...');

  for (const name of defaultCategories) {
    await prisma.category.upsert({
      where: { name }, // ensure no duplicates
      update: {},
      create: {
        name,
        isDefault: true,
      },
    });
  }

  console.log('✔ Done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
