import { adapterRegistry } from '../../adapters/registry.js';
import { ensureGoogleAccessToken } from '../../integrations/google-auth.js';
import { resolveGoogleConnection } from '../../sync/google/resolve-connection.js';
import { syncGoogleCalendar } from '../../sync/google/calendar-sync.js';
import { syncGoogleTasks } from '../../sync/google/tasks-sync.js';

const GOOGLE_PROVIDERS = new Set(['google-calendar', 'google-tasks', 'google-keep']);

function getAdapter(providerId) {
  return adapterRegistry.find((item) => item.id === providerId) || null;
}

async function runGoogleProviderSync(providerId, input) {
  const adapter = getAdapter(providerId);
  if (!adapter) return { ok: false, error: 'provider_not_found' };

  const connection = await resolveGoogleConnection(providerId, input.connection || {});
  if (!connection) return { ok: false, error: 'google_connection_not_configured' };

  const accessToken = await ensureGoogleAccessToken(connection);
  if (!accessToken) return { ok: false, error: 'google_access_token_unavailable' };

  const stats = providerId === 'google-calendar'
    ? await syncGoogleCalendar({ accessToken, connection, adapter })
    : await syncGoogleTasks({ accessToken, connection, adapter });

  return {
    ok: stats.errors.length === 0 || stats.pulled > 0 || stats.pushed > 0 || stats.skipped > 0,
    providerId,
    mode: input.mode || 'poll',
    stats,
  };
}

export async function runProviderSync(providerId, input = {}) {
  const mode = input.mode || 'poll';
  if (mode !== 'poll') {
    return { ok: false, error: 'unsupported_mode', mode };
  }

  if (providerId === 'google-tasks' || providerId === 'google-calendar') {
    return runGoogleProviderSync(providerId, input);
  }

  const adapter = getAdapter(providerId);
  if (!adapter) return { ok: false, error: 'provider_not_found' };

  if (GOOGLE_PROVIDERS.has(providerId)) {
    await ensureGoogleAccessToken(input.connection || {});
  }

  return { ok: false, error: 'provider_sync_not_implemented', providerId };
}

export async function runGoogleSyncBatch(input = {}) {
  const tasks = await runProviderSync('google-tasks', input);
  const calendar = await runProviderSync('google-calendar', input);
  return {
    ok: tasks.ok || calendar.ok,
    mode: input.mode || 'poll',
    results: {
      'google-tasks': tasks,
      'google-calendar': calendar,
    },
  };
}
