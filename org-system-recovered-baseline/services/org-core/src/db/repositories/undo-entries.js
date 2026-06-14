import { getPool } from '../client.js';
export async function listUndoEntryRows() { return (await getPool().query('select * from undo_entries order by created_at desc')).rows; }
export async function insertUndoEntryRow(input) { return (await getPool().query('insert into undo_entries(audit_event_id) values ($1) returning *', [input.auditEventId || null])).rows[0]; }
