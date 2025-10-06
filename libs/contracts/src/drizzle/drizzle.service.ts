import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '@app/contracts/database/schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db: NeonDatabase<typeof schema>;
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // Pool WebSocket optimisé pour Neon avec support des transactions
    this.pool = new Pool({
      connectionString,
      max: 10, // Nombre de connexions dans le pool
    });

    this.db = drizzle(this.pool, { schema });

    console.log('✅ Connected to Neon PostgreSQL database (WebSocket pool)');
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('👋 Disconnected from database');
  }
}
