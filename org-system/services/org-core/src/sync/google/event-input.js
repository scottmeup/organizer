import { parseMetadataBlock } from '../../metadata/parser.js';
import { buildTaskDescription } from './task-input.js';

export function buildEventInputFromRemote(adapter, remote) {
  const normalized = adapter.normalizeInbound(remote);
  const parsed = parseMetadataBlock(remote.description || '');
  const metadata = parsed.found ? parsed.metadata : {};
  const description = parsed.found
    ? [parsed.before, parsed.after].filter(Boolean).join('\n\n')
    : (remote.description || '');

  return {
    title: normalized.title,
    startsAt: normalized.startsAt || null,
    endsAt: normalized.endsAt || null,
    metadata,
    description,
  };
}

export { buildTaskDescription as buildEventDescription };
