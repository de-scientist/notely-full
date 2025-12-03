// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default global categories
const globalCategories = [
  { name: 'Ideas', description: 'Raw sparks of thought', isDefault: true },
  { name: 'Work', description: 'Professional notes and tasks', isDefault: true },
  { name: 'Personal', description: 'Life, heart, reflection', isDefault: true },
  { name: 'Projects', description: 'Builds, drafts, blueprints', isDefault: true },
];

async function main() {
  console.log('Seeding global categories...');

  // 1️⃣ Upsert global categories (userId: null)
  for (const cat of globalCategories) {
    await prisma.category.upsert({
      where: {
        name_userId: { name: cat.name, userId: null },
      },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        isDefault: cat.isDefault,
        userId: null,
      },
    });
  }

  console.log('Linking global categories to users...');

  // 2️⃣ Fetch all users
  const users = await prisma.user.findMany();

  for (const user of users) {
    for (const cat of globalCategories) {
      // Check if user already has this category
      const exists = await prisma.category.findUnique({
        where: {
          name_userId: { name: cat.name, userId: user.id },
        },
      });

      if (!exists) {
        // Create a copy of global category for this user
        await prisma.category.create({
          data: {
            name: cat.name,
            description: cat.description,
            isDefault: cat.isDefault,
            userId: user.id,
          },
        });
      }
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
