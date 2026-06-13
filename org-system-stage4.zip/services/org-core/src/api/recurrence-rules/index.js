import { listRecurrenceRuleRows, insertRecurrenceRuleRow, getRecurrenceRuleRow, updateRecurrenceRuleRow, deleteRecurrenceRuleRow } from '../../db/repositories/recurrence-rules.js';
const map = (row) => row ? ({ id: row.id, ownerType: row.owner_type, ownerId: row.owner_id, config: typeof row.config === 'string' ? JSON.parse(row.config || '{}') : row.config, createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listRecurrenceRules() { return (await listRecurrenceRuleRows()).map(map); }
export async function createRecurrenceRule(input) { return map(await insertRecurrenceRuleRow(input)); }
export async function getRecurrenceRule(id) { return map(await getRecurrenceRuleRow(id)); }
export async function updateRecurrenceRule(id, input) { return map(await updateRecurrenceRuleRow(id, input)); }
export async function deleteRecurrenceRule(id) { return deleteRecurrenceRuleRow(id); }
