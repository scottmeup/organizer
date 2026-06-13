import { getPool } from './client.js';
import { runMigrations } from './migrate.js';
let ready = false;
export async function ensureDatabase() {
  if (ready) return true;
  if (!process.env.DATABASE_URL) return false;
  const pool = getPool();
  await pool.query('select 1');
  await runMigrations();
  ready = true;
  return true;
}
