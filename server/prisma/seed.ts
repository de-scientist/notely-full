// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default categories for every user
const defaultCategories = [
  { name: 'Ideas', description: 'Raw sparks of thought', isDefault: true },
  { name: 'Work', description: 'Professional notes and tasks', isDefault: true },
  { name: 'Personal', description: 'Life, heart, reflection', isDefault: true },
  { name: 'Projects', description: 'Builds, drafts, blueprints', isDefault: true },
];

async function main() {
  console.log('Start seeding categories...');

  // Fetch all users
  const users = await prisma.user.findMany();

  for (const user of users) {
    for (const cat of defaultCategories) {
      await prisma.category.upsert({
        where: {
          name_userId: {
            name: cat.name,
            userId: user.id,
          },
        },
        update: {},
        create: {
          ...cat,
          userId: user.id,
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
