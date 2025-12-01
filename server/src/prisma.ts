import { PrismaClient } from '@prisma/client';

// Define the interface that adds the 'prisma' property to the standard global object.
// This is the cleanest way to extend the global object's type.
interface GlobalForPrisma extends NodeJS.Global {
  prisma?: PrismaClient;
}

// Cast the global object to the new, extended interface type.
// You no longer need `unknown as` because you are casting to a type that extends global.
const globalForPrisma: GlobalForPrisma = global as GlobalForPrisma;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}