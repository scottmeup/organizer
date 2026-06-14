import { listTaskRows, insertTaskRow, getTaskRow, updateTaskRow, deleteTaskRow, restoreTaskRow } from '../../db/repositories/tasks.js';
import { insertAuditEventRow } from '../../db/repositories/audit-events.js';
import { insertUndoEntryRow } from '../../db/repositories/undo-entries.js';

const map = (row) => row ? ({
  id: row.id,
  title: row.title,
  status: row.status,
  dueDate: row.due_date,
  description: row.description,
  metadataYaml: row.metadata_yaml,
  metadata: JSON.parse(row.metadata_json || '{}'),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}) : null;

export async function listTasks() { return (await listTaskRows()).map(map); }

export async function createTask(input) {
  const row = await insertTaskRow(input);
  const audit = await insertAuditEventRow({ eventType: 'task_created', payload: { after: row } });
  await insertUndoEntryRow({ auditEventId: audit.id });
  return map(row);
}

export async function getTask(id) { return map(await getTaskRow(id)); }

export async function updateTask(id, input) {
  const before = await getTaskRow(id);
  if (!before) return null;
  const row = await updateTaskRow(id, input);
  if (!row) return null;
  const audit = await insertAuditEventRow({ eventType: 'task_updated', payload: { before, after: row } });
  await insertUndoEntryRow({ auditEventId: audit.id });
  return map(row);
}

export async function deleteTask(id) {
  const before = await getTaskRow(id);
  if (!before) return false;
  const ok = await deleteTaskRow(id);
  if (ok) {
    const audit = await insertAuditEventRow({ eventType: 'task_deleted', payload: { before } });
    await insertUndoEntryRow({ auditEventId: audit.id });
  }
  return ok;
}

export { restoreTaskRow };
