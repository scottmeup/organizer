import * as repo from '../../db/repositories/entities/shopping-items.js';
import { recordAudit } from '../common/audit.js';
const map = (row) => row ? ({ id: row.id, title: row.title, quantity: row.quantity, checked: row.checked, createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listShoppingItems() { return (await repo.listRows()).map(map); }
export async function createShoppingItem(input) { const row = await repo.insertRow(input); await recordAudit('shopping_item_created', row); return map(row); }
export async function getShoppingItem(id) { return map(await repo.getRow(id)); }
export async function updateShoppingItem(id, input) { const row = await repo.updateRow(id, input); if (!row) return null; await recordAudit('shopping_item_updated', row); return map(row); }
export async function deleteShoppingItem(id) { const ok = await repo.deleteRow(id); if (ok) await recordAudit('shopping_item_deleted', { id }); return ok; }
