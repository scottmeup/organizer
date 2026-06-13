import * as repo from '../../db/repositories/entities/recurrence-rules.js';
import { parseJson } from '../../utils/map-row.js';
import { recordAudit } from '../common/audit.js';
const map = (row) => row ? ({ id: row.id, ownerType: row.owner_type, ownerId: row.owner_id, config: parseJson(row.config), createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listRecurrenceRules() { return (await repo.listRows()).map(map); }
export async function createRecurrenceRule(input) { const row = await repo.insertRow(input); await recordAudit('recurrence_rule_created', row); return map(row); }
export async function getRecurrenceRule(id) { return map(await repo.getRow(id)); }
export async function updateRecurrenceRule(id, input) { const row = await repo.updateRow(id, input); if (!row) return null; await recordAudit('recurrence_rule_updated', row); return map(row); }
export async function deleteRecurrenceRule(id) { const ok = await repo.deleteRow(id); if (ok) await recordAudit('recurrence_rule_deleted', { id }); return ok; }
