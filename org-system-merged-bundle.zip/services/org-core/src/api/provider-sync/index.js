import { adapterRegistry } from '../../adapters/registry.js';
import { ensureGoogleAccessToken } from '../../integrations/google-auth.js';
import * as mappingRepo from '../../db/repositories/sync-mappings.js';
export async function runProviderSync(providerId, input) {
  const adapter = adapterRegistry.find((item) => item.id === providerId);
  if (!adapter) return { ok: false, error: 'provider_not_found' };
  if (providerId === 'google-calendar' || providerId === 'google-tasks' || providerId === 'google-keep') {
    await ensureGoogleAccessToken(input.connection || {});
  }
  if (input.mapping) await mappingRepo.upsertRow(input.mapping);
  return { ok: true, providerId, received: input };
}
