import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from '@prisma/config';

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});
