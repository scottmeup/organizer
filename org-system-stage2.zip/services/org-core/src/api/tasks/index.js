import { listTaskRows, insertTaskRow, getTaskRow, updateTaskRow, deleteTaskRow } from '../../db/repositories/tasks.js';
const map = (row) => row ? ({ id: row.id, title: row.title, status: row.status, dueDate: row.due_date, description: row.description, metadataYaml: row.metadata_yaml, metadata: JSON.parse(row.metadata_json || '{}'), createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listTasks() { return (await listTaskRows()).map(map); }
export async function createTask(input) { return map(await insertTaskRow(input)); }
export async function getTask(id) { return map(await getTaskRow(id)); }
export async function updateTask(id, input) { return map(await updateTaskRow(id, input)); }
export async function deleteTask(id) { return deleteTaskRow(id); }
