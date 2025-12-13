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
    // FIX: Use findUnique with the compound key to check for existence
    // The compound key is [name, userId] where userId is null for global categories
    const exists = await prisma.category.findUnique({
      where: { 
        name_userId: { 
          name: cat.name, 
          userId: null // THIS IS NOW VALID because of String? in schema.prisma
        } 
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
      // This part was already correct for the user-linked categories
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