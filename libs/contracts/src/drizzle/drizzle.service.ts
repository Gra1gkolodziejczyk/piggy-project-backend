import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@app/contracts/database/schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    this.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.db = drizzle(this.pool, { schema });

    console.log('✅ Drizzle connected to PostgreSQL (Neon) via pg driver');
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('🔌 Database connection closed');
  }
}
