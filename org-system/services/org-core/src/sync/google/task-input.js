import { parseMetadataBlock, serializeMetadataBlock } from '../../metadata/parser.js';

export function buildTaskInputFromRemote(adapter, remote) {
  const normalized = adapter.normalizeInbound(remote);
  const parsed = parseMetadataBlock(remote.notes || '');
  const metadata = parsed.found ? parsed.metadata : {};
  const description = parsed.found
    ? [parsed.before, parsed.after].filter(Boolean).join('\n\n')
    : (remote.notes || '');

  return {
    title: normalized.title,
    status: normalized.status,
    dueDate: normalized.dueDate || null,
    metadata,
    description,
  };
}

export function buildTaskDescription(canonicalRow, metadata) {
  const parsed = parseMetadataBlock(canonicalRow.description || '');
  const body = parsed.found ? [parsed.before, parsed.after].filter(Boolean).join('\n\n') : (canonicalRow.description || '');
  const block = serializeMetadataBlock(metadata || JSON.parse(canonicalRow.metadata_json || '{}'));
  return [body, block].filter(Boolean).join('\n\n');
}
