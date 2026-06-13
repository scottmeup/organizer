import yaml from 'js-yaml';

const START = '[orgsys]';
const END = '[/orgsys]';

export function parseMetadataBlock(text) {
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    return { found: false, metadata: null, body: text };
  }
  const before = text.slice(0, start).trim();
  const block = text.slice(start + START.length, end).trim();
  const after = text.slice(end + END.length).trim();
  const metadata = yaml.load(block) || {};
  return { found: true, metadata, before, after };
}

export function serializeMetadataBlock(metadata) {
  const block = yaml.dump(metadata, { lineWidth: 120 }).trim();
  return `${START}
${block}
${END}`;
}
