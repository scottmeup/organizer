import * as repo from '../../db/repositories/entities/tasks.js';
import { parseJson } from '../../utils/map-row.js';
import { recordAudit } from '../common/audit.js';
const map = (row) => row ? ({ id: row.id, title: row.title, status: row.status, dueDate: row.due_date, description: row.description, metadataYaml: row.metadata_yaml, metadata: parseJson(row.metadata_json), createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listTasks() { return (await repo.listRows()).map(map); }
export async function createTask(input) { const row = await repo.insertRow(input); await recordAudit('task_created', row); return map(row); }
export async function getTask(id) { return map(await repo.getRow(id)); }
export async function updateTask(id, input) { const row = await repo.updateRow(id, input); if (!row) return null; await recordAudit('task_updated', row); return map(row); }
export async function deleteTask(id) { const ok = await repo.deleteRow(id); if (ok) await recordAudit('task_deleted', { id }); return ok; }
