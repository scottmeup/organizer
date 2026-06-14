import crypto from 'crypto';
import { adapterRegistry } from '../../adapters/registry.js';
import { ensureGoogleAccessToken } from '../../integrations/google-auth.js';
import {
  stopGoogleWatchChannel,
  watchGoogleCalendarEvents,
} from '../../integrations/google-calendar-api.js';
import * as watchRepo from '../../db/repositories/google-calendar-watch.js';
import { resolveGoogleConnection } from './resolve-connection.js';
import {
  buildCalendarWebhookUrl,
  pullGoogleCalendarChanges,
  resolveCalendarIds,
} from './calendar-sync.js';

function channelExpirationFromMs(expirationMs) {
  return new Date(Number(expirationMs));
}

function getCalendarAdapter() {
  return adapterRegistry.find((item) => item.id === 'google-calendar') || null;
}

function resolveWebhookToken(existingToken) {
  return process.env.GOOGLE_CALENDAR_WEBHOOK_TOKEN || existingToken || crypto.randomBytes(24).toString('hex');
}

async function stopExistingWatch(accessToken, calendarId) {
  const existing = await watchRepo.getWatchChannelByCalendarId(calendarId);
  if (!existing) return;
  try {
    await stopGoogleWatchChannel(accessToken, {
      id: existing.channel_id,
      resourceId: existing.resource_id,
    });
  } catch (_error) {
    // Channel may already be expired server-side.
  }
  await watchRepo.deleteWatchChannelByCalendarId(calendarId);
}

export async function registerGoogleCalendarWatch({ accessToken, connection, adapter, calendarId }) {
  const webhookUrl = buildCalendarWebhookUrl();
  if (!webhookUrl) {
    return { ok: false, error: 'google_calendar_webhook_url_not_configured' };
  }
  if (!webhookUrl.startsWith('https://')) {
    return { ok: false, error: 'google_calendar_webhook_requires_https' };
  }

  const existing = await watchRepo.getWatchChannelByCalendarId(calendarId);
  const webhookToken = resolveWebhookToken(existing?.webhook_token);
  const channelId = crypto.randomUUID();

  await stopExistingWatch(accessToken, calendarId);

  const initialPull = await pullGoogleCalendarChanges({
    accessToken,
    calendarId,
    adapter,
    syncToken: existing?.sync_token || null,
  });

  const watch = await watchGoogleCalendarEvents(accessToken, calendarId, {
    id: channelId,
    type: 'web_hook',
    address: webhookUrl,
    token: webhookToken,
  });

  const row = await watchRepo.upsertWatchChannelRow({
    calendarId,
    channelId: watch.id || channelId,
    resourceId: watch.resourceId,
    expiration: channelExpirationFromMs(watch.expiration),
    webhookToken,
    syncToken: initialPull.nextSyncToken || null,
  });

  return {
    ok: true,
    calendarId,
    channelId: row.channel_id,
    resourceId: row.resource_id,
    expiration: row.expiration,
    webhookUrl,
    initialPull: initialPull.stats,
  };
}

export async function registerAllGoogleCalendarWatches(input = {}) {
  const connection = await resolveGoogleConnection('google-calendar', input.connection || {});
  if (!connection) return { ok: false, error: 'google_connection_not_configured' };

  const accessToken = await ensureGoogleAccessToken(connection);
  if (!accessToken) return { ok: false, error: 'google_access_token_unavailable' };

  const adapter = input.adapter || getCalendarAdapter();
  if (!adapter) return { ok: false, error: 'adapter_not_found' };

  const calendarIds = await resolveCalendarIds(accessToken, connection);
  const results = [];

  for (const calendarId of calendarIds) {
    try {
      results.push(await registerGoogleCalendarWatch({ accessToken, connection, adapter, calendarId }));
    } catch (error) {
      results.push({ ok: false, calendarId, error: error.message || String(error) });
    }
  }

  return {
    ok: results.some((item) => item.ok),
    calendars: results,
  };
}

export async function renewExpiringGoogleCalendarWatches(input = {}) {
  const withinMs = input.withinMs || 24 * 60 * 60 * 1000;
  const expiring = await watchRepo.listExpiringWatchChannelRows(withinMs);
  if (!expiring.length) {
    return { ok: true, renewed: 0, calendars: [] };
  }

  const connection = await resolveGoogleConnection('google-calendar', input.connection || {});
  if (!connection) return { ok: false, error: 'google_connection_not_configured' };

  const accessToken = await ensureGoogleAccessToken(connection);
  if (!accessToken) return { ok: false, error: 'google_access_token_unavailable' };

  const adapter = input.adapter || getCalendarAdapter();
  if (!adapter) return { ok: false, error: 'adapter_not_found' };

  const results = [];
  for (const row of expiring) {
    try {
      results.push(await registerGoogleCalendarWatch({
        accessToken,
        connection,
        adapter,
        calendarId: row.calendar_id,
      }));
    } catch (error) {
      results.push({ ok: false, calendarId: row.calendar_id, error: error.message || String(error) });
    }
  }

  return {
    ok: results.some((item) => item.ok),
    renewed: results.filter((item) => item.ok).length,
    calendars: results,
  };
}

export async function processGoogleCalendarWebhookNotification(headers) {
  const channelId = headers['x-goog-channel-id'];
  const resourceState = headers['x-goog-resource-state'];
  const channelToken = headers['x-goog-channel-token'];

  if (!channelId) {
    return { ok: false, error: 'missing_channel_id' };
  }

  const channel = await watchRepo.getWatchChannelByChannelId(channelId);
  if (!channel) {
    return { ok: false, error: 'unknown_channel', channelId };
  }

  const expectedToken = channel.webhook_token || process.env.GOOGLE_CALENDAR_WEBHOOK_TOKEN;
  if (expectedToken && channelToken !== expectedToken) {
    return { ok: false, error: 'invalid_channel_token', channelId };
  }

  if (resourceState === 'sync') {
    return { ok: true, channelId, action: 'acknowledged_sync' };
  }

  if (resourceState !== 'exists' && resourceState !== 'not_exists') {
    return { ok: true, channelId, action: 'ignored', resourceState };
  }

  const connection = await resolveGoogleConnection('google-calendar', {});
  if (!connection) return { ok: false, error: 'google_connection_not_configured' };

  const accessToken = await ensureGoogleAccessToken(connection);
  if (!accessToken) return { ok: false, error: 'google_access_token_unavailable' };

  const adapter = getCalendarAdapter();
  if (!adapter) return { ok: false, error: 'adapter_not_found' };

  const result = await pullGoogleCalendarChanges({
    accessToken,
    calendarId: channel.calendar_id,
    adapter,
    syncToken: channel.sync_token,
  });

  await watchRepo.updateWatchChannelSyncToken(channel.channel_id, result.nextSyncToken || null);

  return {
    ok: true,
    channelId,
    calendarId: channel.calendar_id,
    resourceState,
    reset: result.reset || false,
    stats: result.stats,
  };
}

const pendingWebhookJobs = new Set();

export function scheduleGoogleCalendarWebhookSync(headers) {
  const channelId = headers['x-goog-channel-id'];
  if (!channelId || pendingWebhookJobs.has(channelId)) {
    return;
  }
  pendingWebhookJobs.add(channelId);
  setImmediate(async () => {
    try {
      const result = await processGoogleCalendarWebhookNotification(headers);
      console.log(JSON.stringify({ event: 'google_calendar_webhook_sync', ...result }));
    } catch (error) {
      console.error(JSON.stringify({ event: 'google_calendar_webhook_sync_failed', channelId, error: error.message || String(error) }));
    } finally {
      pendingWebhookJobs.delete(channelId);
    }
  });
}

export async function listGoogleCalendarWatchChannels() {
  return (await watchRepo.listWatchChannelRows()).map((row) => ({
    id: row.id,
    calendarId: row.calendar_id,
    channelId: row.channel_id,
    resourceId: row.resource_id,
    expiration: row.expiration,
    hasSyncToken: !!row.sync_token,
    updatedAt: row.updated_at,
  }));
}
