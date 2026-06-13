import { listUndoEntryRows } from '../../db/repositories/undo-entries.js';
const map = (row) => row ? ({ id: row.id, auditEventId: row.audit_event_id, createdAt: row.created_at }) : null;
export async function listUndoEntries() { return (await listUndoEntryRows()).map(map); }
