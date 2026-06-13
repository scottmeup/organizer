export function parseJson(value) {
  if (!value) return {};
  return typeof value === 'string' ? JSON.parse(value || '{}') : value;
}
