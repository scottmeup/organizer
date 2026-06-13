import * as repo from '../../db/repositories/entities/reports.js';
import { parseJson } from '../../utils/map-row.js';
import { recordAudit } from '../common/audit.js';
const map = (row) => row ? ({ id: row.id, name: row.name, config: parseJson(row.config), createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listReports() { return (await repo.listRows()).map(map); }
export async function createReport(input) { const row = await repo.insertRow(input); await recordAudit('report_created', row); return map(row); }
export async function getReport(id) { return map(await repo.getRow(id)); }
export async function updateReport(id, input) { const row = await repo.updateRow(id, input); if (!row) return null; await recordAudit('report_updated', row); return map(row); }
export async function deleteReport(id) { const ok = await repo.deleteRow(id); if (ok) await recordAudit('report_deleted', { id }); return ok; }
