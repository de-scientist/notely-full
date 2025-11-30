import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasources: {
    db: {
      provider: 'sqlserver',
      url: process.env.DATABASE_URL!,
    },
  },
});
