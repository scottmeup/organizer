import { getPool } from '../client.js';
export async function listReportRows() { return (await getPool().query('select * from report_definitions order by created_at desc')).rows; }
export async function getReportRow(id) { return (await getPool().query('select * from report_definitions where id = $1', [id])).rows[0] || null; }
export async function insertReportRow(input) { return (await getPool().query('insert into report_definitions(name, config) values ($1,$2) returning *', [input.name || 'Unnamed report', JSON.stringify(input.config || {})])).rows[0]; }
export async function updateReportRow(id, input) { const existing = await getReportRow(id); if (!existing) return null; const config = input.config || (typeof existing.config === 'string' ? JSON.parse(existing.config || '{}') : existing.config); return (await getPool().query('update report_definitions set name=$2, config=$3, updated_at=now() where id=$1 returning *', [id, input.name || existing.name, JSON.stringify(config)])).rows[0]; }
export async function deleteReportRow(id) { return (await getPool().query('delete from report_definitions where id = $1', [id])).rowCount > 0; }
