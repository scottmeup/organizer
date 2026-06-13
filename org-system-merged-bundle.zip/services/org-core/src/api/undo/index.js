import * as repo from '../../db/repositories/undo-entries.js';
export async function listUndoEntries() { return (await repo.listRows()).map((row) => ({ id: row.id, auditEventId: row.audit_event_id, status: row.status, createdAt: row.created_at, appliedAt: row.applied_at })); }
export async function applyUndoEntry(id) { const row = await repo.markApplied(id); return { ok: !!row, entry: row }; }
