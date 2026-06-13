import * as repo from '../../db/repositories/entities/calendar-events.js';
import { parseJson } from '../../utils/map-row.js';
import { recordAudit } from '../common/audit.js';
const map = (row) => row ? ({ id: row.id, title: row.title, startsAt: row.starts_at, endsAt: row.ends_at, description: row.description, metadataYaml: row.metadata_yaml, metadata: parseJson(row.metadata_json), createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listCalendarEvents() { return (await repo.listRows()).map(map); }
export async function createCalendarEvent(input) { const row = await repo.insertRow(input); await recordAudit('calendar_event_created', row); return map(row); }
export async function getCalendarEvent(id) { return map(await repo.getRow(id)); }
export async function updateCalendarEvent(id, input) { const row = await repo.updateRow(id, input); if (!row) return null; await recordAudit('calendar_event_updated', row); return map(row); }
export async function deleteCalendarEvent(id) { const ok = await repo.deleteRow(id); if (ok) await recordAudit('calendar_event_deleted', { id }); return ok; }
