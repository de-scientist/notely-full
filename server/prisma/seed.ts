import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const globalCategories = [
  { name: 'Ideas', description: 'Raw sparks of thought', isDefault: true, suggestedKeywords: ['brainstorm','concept','note','thought'] },
  { name: 'Work', description: 'Professional notes and tasks', isDefault: true, suggestedKeywords: ['project','task','deadline','meeting'] },
  { name: 'Personal', description: 'Life, heart, reflection', isDefault: true, suggestedKeywords: ['journal','reflection','life','habit'] },
  { name: 'Projects', description: 'Builds, drafts, blueprints', isDefault: true, suggestedKeywords: ['build','prototype','draft','design'] },
];

async function main() {
  console.log('Seeding global categories...');

  for (const cat of globalCategories) {
    // FIX: Revert to findFirst for checking existence of records 
    // where a field in the compound unique key (userId) is null.
    const exists = await prisma.category.findFirst({
      where: { 
        name: cat.name, 
        userId: null // Using null in a findFirst/findMany query is allowed.
      },
    });

    if (!exists) {
      await prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description,
          isDefault: cat.isDefault,
          suggestedKeywords: JSON.stringify(cat.suggestedKeywords),
          userId: null,
        },
      });
    }
  }

  console.log('Linking global categories to users...');
  const users = await prisma.user.findMany();

  for (const user of users) {
    for (const cat of globalCategories) {
      // This part for user-linked categories is correct and uses the compound key 
      // where userId is a string (user.id), so it's safe.
      const exists = await prisma.category.findUnique({
        where: { name_userId: { name: cat.name, userId: user.id } },
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
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });