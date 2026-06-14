import { getPool } from '../client.js';
export async function listSyncMappingRows() { return (await getPool().query('select * from sync_mappings order by updated_at desc')).rows; }
export async function insertSyncMappingRow(input) { return (await getPool().query('insert into sync_mappings(canonical_type, canonical_id, provider_id, remote_id, metadata_hash, native_hash, last_source) values ($1,$2,$3,$4,$5,$6,$7) returning *', [input.canonicalType, input.canonicalId, input.providerId, input.remoteId, input.metadataHash || null, input.nativeHash || null, input.lastSource || null])).rows[0]; }
