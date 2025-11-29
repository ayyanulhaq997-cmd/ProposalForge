import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️ WARNING: DATABASE_URL not set!');
  console.warn('App will start but database operations may fail.');
  console.warn('Please set DATABASE_URL in your environment variables.');
}

// Detect if using Neon or standard PostgreSQL
const isNeonUrl = databaseUrl?.includes('neon.tech');
const connectionString = databaseUrl || 'postgresql://localhost/fallback';

// Create appropriate pool based on database type
let pool: any;
if (isNeonUrl) {
  // Use Neon serverless client for Neon databases
  pool = new NeonPool({ connectionString });
} else {
  // Use standard pg client for Railway and other standard PostgreSQL
  pool = new PgPool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
  });
}

export { pool };

export const db = drizzle({ client: pool, schema });
