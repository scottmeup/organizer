import { getPool } from '../client.js';

export async function listAuditEventRows() {
  return (await getPool().query('select * from audit_events order by created_at desc')).rows;
}

export async function getAuditEventRow(id) {
  return (await getPool().query('select * from audit_events where id = $1', [id])).rows[0] || null;
}

export async function insertAuditEventRow(input) {
  return (await getPool().query(
    'insert into audit_events(event_type, payload) values ($1,$2) returning *',
    [input.eventType, JSON.stringify(input.payload || {})]
  )).rows[0];
}
