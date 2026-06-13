import * as repo from '../../db/repositories/audit-events.js';
import { parseJson } from '../../utils/map-row.js';
export async function listAuditEvents() { return (await repo.listRows()).map((row) => ({ id: row.id, eventType: row.event_type, payload: parseJson(row.payload), createdAt: row.created_at })); }
