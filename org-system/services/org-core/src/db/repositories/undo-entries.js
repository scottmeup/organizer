import { getPool } from '../client.js';

export async function listUndoEntryRows() {
  return (await getPool().query('select * from undo_entries order by created_at desc')).rows;
}

export async function getUndoEntryRow(id) {
  return (await getPool().query('select * from undo_entries where id = $1', [id])).rows[0] || null;
}

export async function insertUndoEntryRow(input) {
  return (await getPool().query(
    'insert into undo_entries(audit_event_id, status) values ($1, $2) returning *',
    [input.auditEventId || null, input.status || 'pending']
  )).rows[0];
}

export async function markUndoEntryApplied(id) {
  return (await getPool().query(
    'update undo_entries set status = $2, applied_at = now() where id = $1 and status = $3 returning *',
    [id, 'applied', 'pending']
  )).rows[0] || null;
}
