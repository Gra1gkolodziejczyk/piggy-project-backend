import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger explicitement depuis la racine
const result = config({ path: resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  process.exit(1);
}

export default {
  schema: './libs/contracts/src/database/schema.ts',
  out: './libs/contracts/src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
