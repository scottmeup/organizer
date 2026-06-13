import * as auditRepo from '../../db/repositories/audit-events.js';
import * as undoRepo from '../../db/repositories/undo-entries.js';
export async function recordAudit(eventType, payload) {
  const audit = await auditRepo.insertRow({ eventType, payload });
  const undo = await undoRepo.insertRow({ auditEventId: audit.id, status: 'pending' });
  return { audit, undo };
}
