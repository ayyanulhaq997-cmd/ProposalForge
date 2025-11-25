import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  }
  return db;
}

// Initialize on first import in production
if (process.env.NODE_ENV === 'production') {
  initializeDatabase();
}

export function getDb() {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}

export function getPool() {
  if (!pool) {
    initializeDatabase();
  }
  return pool!;
}

// For backward compatibility, export db getter
Object.defineProperty(exports, 'db', {
  get: () => getDb()
});

Object.defineProperty(exports, 'pool', {
  get: () => getPool()
});
