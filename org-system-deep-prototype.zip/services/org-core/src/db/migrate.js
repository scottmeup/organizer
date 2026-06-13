import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from './client.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');
export async function runMigrations() {
  const pool = getPool();
  await pool.query('create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())');
  const files = (await fs.readdir(migrationsDir)).filter((n) => n.endsWith('.sql')).sort();
  for (const file of files) {
    const found = await pool.query('select version from schema_migrations where version = $1', [file]);
    if (found.rowCount > 0) continue;
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
    await pool.query('begin');
    try {
      await pool.query(sql);
      await pool.query('insert into schema_migrations(version) values ($1)', [file]);
      await pool.query('commit');
    } catch (error) {
      await pool.query('rollback');
      throw error;
    }
  }
}
