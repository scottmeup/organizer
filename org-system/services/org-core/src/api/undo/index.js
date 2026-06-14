import { getUndoEntryRow, listUndoEntryRows, markUndoEntryApplied } from '../../db/repositories/undo-entries.js';
import { getAuditEventRow } from '../../db/repositories/audit-events.js';
import { deleteTaskRow, restoreTaskRow } from '../../db/repositories/tasks.js';
import { deleteCalendarEventRow, restoreCalendarEventRow } from '../../db/repositories/calendar-events.js';
import { updateTaskRow } from '../../db/repositories/tasks.js';
import { updateCalendarEventRow } from '../../db/repositories/calendar-events.js';

const map = (row) => row ? ({
  id: row.id,
  auditEventId: row.audit_event_id,
  status: row.status || 'pending',
  createdAt: row.created_at,
  appliedAt: row.applied_at,
}) : null;

function parsePayload(row) {
  const payload = row?.payload;
  if (!payload) return {};
  return typeof payload === 'string' ? JSON.parse(payload) : payload;
}

async function compensate(eventType, payload) {
  switch (eventType) {
    case 'task_created':
      return { ok: await deleteTaskRow(payload.after?.id || payload.id), action: 'delete_created_task' };
    case 'task_deleted':
      return { ok: !!(await restoreTaskRow(payload.before)), action: 'restore_deleted_task' };
    case 'task_updated':
      return { ok: !!(await updateTaskRow(payload.before.id, {
        title: payload.before.title,
        status: payload.before.status,
        dueDate: payload.before.due_date,
        description: payload.before.description,
        metadata: JSON.parse(payload.before.metadata_json || '{}'),
      })), action: 'revert_task_update' };
    case 'calendar_event_created':
      return { ok: await deleteCalendarEventRow(payload.after?.id || payload.id), action: 'delete_created_event' };
    case 'calendar_event_deleted':
      return { ok: !!(await restoreCalendarEventRow(payload.before)), action: 'restore_deleted_event' };
    case 'calendar_event_updated':
      return { ok: !!(await updateCalendarEventRow(payload.before.id, {
        title: payload.before.title,
        startsAt: payload.before.starts_at,
        endsAt: payload.before.ends_at,
        description: payload.before.description,
        metadata: JSON.parse(payload.before.metadata_json || '{}'),
      })), action: 'revert_event_update' };
    default:
      return { ok: false, action: 'unsupported_event_type', eventType };
  }
}

export async function listUndoEntries() {
  return (await listUndoEntryRows()).map(map);
}

export async function applyUndoEntry(id) {
  const entry = await getUndoEntryRow(id);
  if (!entry) return { ok: false, error: 'undo_entry_not_found' };
  if (entry.status === 'applied') return { ok: false, error: 'already_applied', entry: map(entry) };

  const audit = await getAuditEventRow(entry.audit_event_id);
  if (!audit) return { ok: false, error: 'audit_event_not_found' };

  const result = await compensate(audit.event_type, parsePayload(audit));
  if (!result.ok) return { ok: false, error: 'compensation_failed', ...result, entry: map(entry) };

  const applied = await markUndoEntryApplied(id);
  return { ok: true, ...result, entry: map(applied) };
}
