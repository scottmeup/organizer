import { getPool } from '../client.js';
import { serializeMetadataBlock } from '../../metadata/parser.js';
export async function listTaskRows() { return (await getPool().query('select * from tasks order by created_at desc')).rows; }
export async function getTaskRow(id) { return (await getPool().query('select * from tasks where id = $1', [id])).rows[0] || null; }
export async function insertTaskRow(input) {
  const metadata = input.metadata || {};
  const description = input.description || serializeMetadataBlock(metadata);
  return (await getPool().query('insert into tasks(title,status,due_date,description,metadata_yaml,metadata_json) values ($1,$2,$3,$4,$5,$6) returning *', [input.title || 'Untitled task', input.status || 'open', input.dueDate || null, description, serializeMetadataBlock(metadata), JSON.stringify(metadata)])).rows[0];
}
export async function updateTaskRow(id, input) {
  const existing = await getTaskRow(id);
  if (!existing) return null;
  const metadata = input.metadata || JSON.parse(existing.metadata_json || '{}');
  return (await getPool().query('update tasks set title=$2,status=$3,due_date=$4,description=$5,metadata_yaml=$6,metadata_json=$7,updated_at=now() where id=$1 returning *', [id, input.title || existing.title, input.status || existing.status, input.dueDate || existing.due_date, input.description || existing.description, serializeMetadataBlock(metadata), JSON.stringify(metadata)])).rows[0];
}
export async function deleteTaskRow(id) { return (await getPool().query('delete from tasks where id = $1', [id])).rowCount > 0; }
