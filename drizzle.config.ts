import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Charger explicitement depuis la racine
const result = config({ path: resolve(__dirname, '.env') });

// Debug
console.log('🔍 Dotenv result:', result);
console.log('📁 .env path:', resolve(__dirname, '.env'));
console.log('🔑 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log(
  '🔑 DATABASE_URL value:',
  process.env.DATABASE_URL?.substring(0, 30) + '...',
);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined!');
  console.error(
    '💡 Make sure you have a .env file at the root with DATABASE_URL defined',
  );
  process.exit(1);
}

export default {
  schema: './libs/contracts/src/database/schema.ts',
  out: './libs/contracts/src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
