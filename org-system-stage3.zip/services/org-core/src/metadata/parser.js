import yaml from 'js-yaml';
const START = '[orgsys]';
const END = '[/orgsys]';
export function parseMetadataBlock(text) {
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (start === -1 || end === -1 || end < start) return { found: false, metadata: null, body: text };
  const before = text.slice(0, start).trim();
  const block = text.slice(start + START.length, end).trim();
  const after = text.slice(end + END.length).trim();
  return { found: true, metadata: yaml.load(block) || {}, before, after };
}
export function serializeMetadataBlock(metadata) {
  return `${START}
${yaml.dump(metadata, { lineWidth: 120 }).trim()}
${END}`;
}
