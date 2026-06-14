import { listShoppingItemRows, insertShoppingItemRow, getShoppingItemRow, updateShoppingItemRow, deleteShoppingItemRow } from '../../db/repositories/shopping-items.js';
const map = (row) => row ? ({ id: row.id, title: row.title, quantity: row.quantity, checked: row.checked, createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listShoppingItems() { return (await listShoppingItemRows()).map(map); }
export async function createShoppingItem(input) { return map(await insertShoppingItemRow(input)); }
export async function getShoppingItem(id) { return map(await getShoppingItemRow(id)); }
export async function updateShoppingItem(id, input) { return map(await updateShoppingItemRow(id, input)); }
export async function deleteShoppingItem(id) { return deleteShoppingItemRow(id); }
