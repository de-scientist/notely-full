// Using require here to avoid strict typing on PrismaClient while schema is evolving.
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
const { PrismaClient } = require('@prisma/client') as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = global as any;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
