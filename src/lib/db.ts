import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as { pool?: Pool };

function getPool() {
  if (globalForDb.pool) return globalForDb.pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000,
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
  });

  globalForDb.pool = pool;
  return pool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}
