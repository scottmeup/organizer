import { listAuditEventRows } from '../../db/repositories/audit-events.js';
const map = (row) => row ? ({ id: row.id, eventType: row.event_type, payload: typeof row.payload === 'string' ? JSON.parse(row.payload || '{}') : row.payload, createdAt: row.created_at }) : null;
export async function listAuditEvents() { return (await listAuditEventRows()).map(map); }
