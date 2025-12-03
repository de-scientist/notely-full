import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default global categories
const globalCategories = [
  { 
    name: 'Ideas', 
    description: 'Raw sparks of thought', 
    isDefault: true,
    suggestedKeywords: ['brainstorm', 'concept', 'note', 'thought'] 
  },
  { 
    name: 'Work', 
    description: 'Professional notes and tasks', 
    isDefault: true,
    suggestedKeywords: ['project', 'task', 'deadline', 'meeting'] 
  },
  { 
    name: 'Personal', 
    description: 'Life, heart, reflection', 
    isDefault: true,
    suggestedKeywords: ['journal', 'reflection', 'life', 'habit'] 
  },
  { 
    name: 'Projects', 
    description: 'Builds, drafts, blueprints', 
    isDefault: true,
    suggestedKeywords: ['build', 'prototype', 'draft', 'design'] 
  },
];

async function main() {
  console.log('Seeding global categories...');

  for (const cat of globalCategories) {
    await prisma.category.upsert({
      where: {
        name_userId: { name: cat.name, userId: '' }, // empty string for global
      },
      update: {},
      create: {
        name: cat.name,
        description: cat.description,
        isDefault: cat.isDefault,
        suggestedKeywords: JSON.stringify(cat.suggestedKeywords), // store as JSON string
        userId: '',
      },
    });
  }

  console.log('Linking global categories to users...');

  const users = await prisma.user.findMany();

  for (const user of users) {
    for (const cat of globalCategories) {
      const exists = await prisma.category.findUnique({
        where: {
          name_userId: { name: cat.name, userId: user.id },
        },
      });

      if (!exists) {
        await prisma.category.create({
          data: {
            name: cat.name,
            description: cat.description,
            isDefault: cat.isDefault,
            suggestedKeywords: JSON.stringify(cat.suggestedKeywords),
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
