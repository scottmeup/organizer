import { listReminderRuleRows, insertReminderRuleRow, getReminderRuleRow, updateReminderRuleRow, deleteReminderRuleRow } from '../../db/repositories/reminder-rules.js';
const map = (row) => row ? ({ id: row.id, ownerType: row.owner_type, ownerId: row.owner_id, config: typeof row.config === 'string' ? JSON.parse(row.config || '{}') : row.config, createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listReminderRules() { return (await listReminderRuleRows()).map(map); }
export async function createReminderRule(input) { return map(await insertReminderRuleRow(input)); }
export async function getReminderRule(id) { return map(await getReminderRuleRow(id)); }
export async function updateReminderRule(id, input) { return map(await updateReminderRuleRow(id, input)); }
export async function deleteReminderRule(id) { return deleteReminderRuleRow(id); }
