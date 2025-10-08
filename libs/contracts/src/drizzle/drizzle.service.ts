import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@app/contracts/database/schema';

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db: NeonHttpDatabase<typeof schema>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // Utilise le driver HTTP de Neon
    const sql = neon(connectionString);

    this.db = drizzle(sql, { schema });

    console.log('✅ Drizzle connected to Neon via HTTP');
  }
}
