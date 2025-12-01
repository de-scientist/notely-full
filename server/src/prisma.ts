import { PrismaClient } from '@prisma/client';

// Define the type for the global object to include the 'prisma' property
// This avoids using 'any' on the global object itself.
interface CustomGlobal extends NodeJS.Global {
  prisma?: PrismaClient;
}

// Cast global to our custom interface
const globalForPrisma = global as unknown as CustomGlobal;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}