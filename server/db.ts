import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ FATAL: DATABASE_URL not set!');
  console.error('Make sure DATABASE_URL is in your environment variables.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

console.log('✓ Using DATABASE_URL:', databaseUrl ? 'Connection string present' : 'MISSING');

export const pool = new Pool({ 
  connectionString: databaseUrl || 'postgresql://localhost/fallback'
});

export const db = drizzle({ client: pool, schema });
