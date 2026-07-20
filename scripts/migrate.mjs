import fs from "node:fs/promises";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for migrations.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

try {
  const sql = await fs.readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  await pool.query(sql);
  await pool.query("DELETE FROM rate_limits WHERE expires_at < NOW()");
  console.log("Database schema is ready.");
} finally {
  await pool.end();
}
