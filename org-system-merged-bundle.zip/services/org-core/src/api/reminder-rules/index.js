import * as repo from '../../db/repositories/entities/reminder-rules.js';
import { parseJson } from '../../utils/map-row.js';
import { recordAudit } from '../common/audit.js';
const map = (row) => row ? ({ id: row.id, ownerType: row.owner_type, ownerId: row.owner_id, config: parseJson(row.config), createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listReminderRules() { return (await repo.listRows()).map(map); }
export async function createReminderRule(input) { const row = await repo.insertRow(input); await recordAudit('reminder_rule_created', row); return map(row); }
export async function getReminderRule(id) { return map(await repo.getRow(id)); }
export async function updateReminderRule(id, input) { const row = await repo.updateRow(id, input); if (!row) return null; await recordAudit('reminder_rule_updated', row); return map(row); }
export async function deleteReminderRule(id) { const ok = await repo.deleteRow(id); if (ok) await recordAudit('reminder_rule_deleted', { id }); return ok; }
