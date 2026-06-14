export function buildMappingKey(input) {
  return `${input.canonicalType}:${input.canonicalId}:${input.providerId}`;
}
