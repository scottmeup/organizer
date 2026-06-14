import { getPool } from '../client.js';

export async function listSyncMappingRows() {
  return (await getPool().query('select * from sync_mappings order by updated_at desc')).rows;
}

export async function findMappingByRemote(providerId, canonicalType, remoteId) {
  return (await getPool().query(
    'select * from sync_mappings where provider_id = $1 and canonical_type = $2 and remote_id = $3',
    [providerId, canonicalType, remoteId]
  )).rows[0] || null;
}

export async function findMappingByCanonical(providerId, canonicalType, canonicalId) {
  return (await getPool().query(
    'select * from sync_mappings where provider_id = $1 and canonical_type = $2 and canonical_id = $3',
    [providerId, canonicalType, canonicalId]
  )).rows[0] || null;
}

export async function insertSyncMappingRow(input) {
  return (await getPool().query(
    'insert into sync_mappings(canonical_type, canonical_id, provider_id, remote_id, metadata_hash, native_hash, last_source) values ($1,$2,$3,$4,$5,$6,$7) returning *',
    [input.canonicalType, input.canonicalId, input.providerId, input.remoteId, input.metadataHash || null, input.nativeHash || null, input.lastSource || null]
  )).rows[0];
}

export async function upsertSyncMappingRow(input) {
  let existing = null;
  if (input.remoteId) {
    existing = await findMappingByRemote(input.providerId, input.canonicalType, input.remoteId);
  }
  if (!existing && input.canonicalId) {
    existing = await findMappingByCanonical(input.providerId, input.canonicalType, input.canonicalId);
  }
  if (existing) {
    return (await getPool().query(
      'update sync_mappings set canonical_id=$2, remote_id=$3, metadata_hash=$4, native_hash=$5, last_source=$6, updated_at=now() where id=$1 returning *',
      [existing.id, input.canonicalId, input.remoteId, input.metadataHash || null, input.nativeHash || null, input.lastSource || null]
    )).rows[0];
  }
  return insertSyncMappingRow(input);
}

/** @deprecated use upsertSyncMappingRow */
export async function upsertRow(input) {
  return upsertSyncMappingRow(input);
}
