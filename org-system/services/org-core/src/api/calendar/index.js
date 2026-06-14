import { listCalendarEventRows, insertCalendarEventRow, getCalendarEventRow, updateCalendarEventRow, deleteCalendarEventRow, restoreCalendarEventRow } from '../../db/repositories/calendar-events.js';
import { insertAuditEventRow } from '../../db/repositories/audit-events.js';
import { insertUndoEntryRow } from '../../db/repositories/undo-entries.js';

const map = (row) => row ? ({
  id: row.id,
  title: row.title,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  description: row.description,
  metadataYaml: row.metadata_yaml,
  metadata: JSON.parse(row.metadata_json || '{}'),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}) : null;

export async function listCalendarEvents() { return (await listCalendarEventRows()).map(map); }

export async function createCalendarEvent(input) {
  const row = await insertCalendarEventRow(input);
  const audit = await insertAuditEventRow({ eventType: 'calendar_event_created', payload: { after: row } });
  await insertUndoEntryRow({ auditEventId: audit.id });
  return map(row);
}

export async function getCalendarEvent(id) { return map(await getCalendarEventRow(id)); }

export async function updateCalendarEvent(id, input) {
  const before = await getCalendarEventRow(id);
  if (!before) return null;
  const row = await updateCalendarEventRow(id, input);
  if (!row) return null;
  const audit = await insertAuditEventRow({ eventType: 'calendar_event_updated', payload: { before, after: row } });
  await insertUndoEntryRow({ auditEventId: audit.id });
  return map(row);
}

export async function deleteCalendarEvent(id) {
  const before = await getCalendarEventRow(id);
  if (!before) return false;
  const ok = await deleteCalendarEventRow(id);
  if (ok) {
    const audit = await insertAuditEventRow({ eventType: 'calendar_event_deleted', payload: { before } });
    await insertUndoEntryRow({ auditEventId: audit.id });
  }
  return ok;
}

export { restoreCalendarEventRow };
