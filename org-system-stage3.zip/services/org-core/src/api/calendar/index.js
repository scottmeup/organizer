import { listCalendarEventRows, insertCalendarEventRow, getCalendarEventRow, updateCalendarEventRow, deleteCalendarEventRow } from '../../db/repositories/calendar-events.js';
const map = (row) => row ? ({ id: row.id, title: row.title, startsAt: row.starts_at, endsAt: row.ends_at, description: row.description, metadataYaml: row.metadata_yaml, metadata: JSON.parse(row.metadata_json || '{}'), createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listCalendarEvents() { return (await listCalendarEventRows()).map(map); }
export async function createCalendarEvent(input) { return map(await insertCalendarEventRow(input)); }
export async function getCalendarEvent(id) { return map(await getCalendarEventRow(id)); }
export async function updateCalendarEvent(id, input) { return map(await updateCalendarEventRow(id, input)); }
export async function deleteCalendarEvent(id) { return deleteCalendarEventRow(id); }
