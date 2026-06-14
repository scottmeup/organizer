import { getPool } from '../client.js';
import { serializeMetadataBlock } from '../../metadata/parser.js';
export async function listCalendarEventRows() { return (await getPool().query('select * from calendar_events order by starts_at asc nulls last')).rows; }
export async function getCalendarEventRow(id) { return (await getPool().query('select * from calendar_events where id = $1', [id])).rows[0] || null; }
export async function insertCalendarEventRow(input) { const metadata = input.metadata || {}; const description = input.description || serializeMetadataBlock(metadata); return (await getPool().query('insert into calendar_events(title,starts_at,ends_at,description,metadata_yaml,metadata_json) values ($1,$2,$3,$4,$5,$6) returning *', [input.title || 'Untitled event', input.startsAt || null, input.endsAt || null, description, serializeMetadataBlock(metadata), JSON.stringify(metadata)])).rows[0]; }
export async function updateCalendarEventRow(id, input) { const existing = await getCalendarEventRow(id); if (!existing) return null; const metadata = input.metadata || JSON.parse(existing.metadata_json || '{}'); return (await getPool().query('update calendar_events set title=$2,starts_at=$3,ends_at=$4,description=$5,metadata_yaml=$6,metadata_json=$7,updated_at=now() where id=$1 returning *', [id, input.title || existing.title, input.startsAt || existing.starts_at, input.endsAt || existing.ends_at, input.description || existing.description, serializeMetadataBlock(metadata), JSON.stringify(metadata)])).rows[0]; }
export async function deleteCalendarEventRow(id) { return (await getPool().query('delete from calendar_events where id = $1', [id])).rowCount > 0; }
export async function restoreCalendarEventRow(row) {
  return (await getPool().query(
    'insert into calendar_events(id, title, starts_at, ends_at, description, metadata_yaml, metadata_json, created_at, updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (id) do nothing returning *',
    [row.id, row.title, row.starts_at, row.ends_at, row.description, row.metadata_yaml, row.metadata_json, row.created_at, row.updated_at]
  )).rows[0] || null;
}
