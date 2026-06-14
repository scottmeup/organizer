import { listSyncMappingRows } from '../../db/repositories/sync-mappings.js';
const map = (row) => row ? ({ id: row.id, canonicalType: row.canonical_type, canonicalId: row.canonical_id, providerId: row.provider_id, remoteId: row.remote_id, metadataHash: row.metadata_hash, nativeHash: row.native_hash, lastSource: row.last_source, createdAt: row.created_at, updatedAt: row.updated_at }) : null;
export async function listSyncMappings() { return (await listSyncMappingRows()).map(map); }
