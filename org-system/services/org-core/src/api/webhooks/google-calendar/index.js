import {
  listGoogleCalendarWatchChannels,
  processGoogleCalendarWebhookNotification,
  registerAllGoogleCalendarWatches,
  renewExpiringGoogleCalendarWatches,
  scheduleGoogleCalendarWebhookSync,
} from '../../sync/google/calendar-watch.js';

export async function handleGoogleCalendarWebhook(req) {
  const headers = Object.fromEntries(
    Object.entries(req.headers || {}).map(([key, value]) => [key.toLowerCase(), value])
  );

  const resourceState = headers['x-goog-resource-state'];
  if (resourceState === 'sync' || resourceState === 'exists' || resourceState === 'not_exists') {
    scheduleGoogleCalendarWebhookSync(headers);
    return { ok: true, accepted: true, resourceState };
  }

  return { ok: true, accepted: false, resourceState: resourceState || null };
}

export async function registerCalendarWatches(input = {}) {
  return registerAllGoogleCalendarWatches(input);
}

export async function renewCalendarWatches(input = {}) {
  return renewExpiringGoogleCalendarWatches(input);
}

export async function listCalendarWatches() {
  return listGoogleCalendarWatchChannels();
}

export async function runCalendarWebhookSyncNow(headers) {
  return processGoogleCalendarWebhookNotification(
    Object.fromEntries(Object.entries(headers || {}).map(([key, value]) => [key.toLowerCase(), value]))
  );
}
