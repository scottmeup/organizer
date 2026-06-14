import { listReportRows, insertReportRow, getReportRow, updateReportRow, deleteReportRow } from '../../db/repositories/reports.js';
const map = (row) => row ? ({ id: row.id, name: row.name, config: typeof row.config === 'string' ? JSON.parse(row.config || '{}') : row.config, createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listReports() { return (await listReportRows()).map(map); }
export async function createReport(input) { return map(await insertReportRow(input)); }
export async function getReport(id) { return map(await getReportRow(id)); }
export async function updateReport(id, input) { return map(await updateReportRow(id, input)); }
export async function deleteReport(id) { return deleteReportRow(id); }
