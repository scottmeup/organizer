import { getPool } from '../client.js';
export async function listRows() { return (await getPool().query('select * from shopping_items order by created_at desc')).rows; }
export async function getRow(id) { return (await getPool().query('select * from shopping_items where id = $1', [id])).rows[0] || null; }
export async function insertRow(input) { return (await getPool().query('insert into shopping_items(title,quantity,checked) values ($1,$2,$3) returning *', [input.title || 'Untitled item', input.quantity || 1, input.checked || false])).rows[0]; }
export async function updateRow(id, input) { const existing = await getRow(id); if (!existing) return null; return (await getPool().query('update shopping_items set title=$2,quantity=$3,checked=$4,updated_at=now() where id=$1 returning *', [id, input.title || existing.title, input.quantity ?? existing.quantity, input.checked ?? existing.checked])).rows[0]; }
export async function deleteRow(id) { return (await getPool().query('delete from shopping_items where id = $1', [id])).rowCount > 0; }
