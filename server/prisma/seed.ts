// server/prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const staticCategories = [
    { id: '1', name: 'Productivity' },
    { id: '2', name: 'Design' },
    { id: '3', name: 'Engineering' },
    { id: '4', name: 'Personal Growth' },
    { id: '5', name: 'Career' },
    { id: '6', name: 'Motivation' },
    { id: '7', name: 'Family Affair' },
    { id: '8', name: 'Spiritual' },
    { id: '9', name: 'Study' },
    { id: '0', name: 'Uncategorized' },
];

async function main() {
    console.log(`Start seeding categories...`);

    for (const cat of staticCategories) {
        // Use upsert to avoid duplicate creation if run multiple times
        await prisma.category.upsert({
            where: { id: cat.id },
            update: { name: cat.name },
            create: { id: cat.id, name: cat.name },
        });
    }

    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });