import { PrismaClient } from '@prisma/client';

// 1. Declare a global variable to store the Prisma client instance
// This prevents multiple client instances from being created during development 
// in environments like Next.js or other hot-reloading systems.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 2. Initialize the Prisma client
// In production, we create a new client every time.
// In development, we use the global variable if it exists.
export const db = global.prisma || new PrismaClient({
  // Optionally, log database queries during development
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// 3. Assign the client to the global variable in development
if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}