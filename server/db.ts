import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️ WARNING: DATABASE_URL not set!');
  console.warn('App will start but database operations may fail.');
  console.warn('Please set DATABASE_URL in your environment variables.');
}

console.log('✓ Using DATABASE_URL:', databaseUrl ? 'Connection string present' : 'NOT SET (using fallback)');

// Handle Railway SSL certificate issues by disabling verification for private connections
const connectionString = databaseUrl || 'postgresql://localhost/fallback';
const connectionConfig: any = { 
  connectionString,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
};

// For Railway and other external services, disable SSL certificate verification
if (connectionString.includes('railway.internal') || connectionString.includes('neon.tech')) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(connectionConfig);

export const db = drizzle({ client: pool, schema });
