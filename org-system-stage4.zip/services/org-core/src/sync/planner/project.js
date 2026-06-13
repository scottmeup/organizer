export function planProjection(input) {
  return { canonicalType: input.canonicalType, providerId: input.providerId, nativeFeatures: input.nativeFeatures || [] };
}
