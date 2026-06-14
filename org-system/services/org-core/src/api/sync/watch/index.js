import {
  listCalendarWatches,
  registerCalendarWatches,
  renewCalendarWatches,
} from '../webhooks/google-calendar/index.js';

export async function registerGoogleCalendarWatchSubscriptions(input = {}) {
  return registerCalendarWatches(input);
}

export async function renewGoogleCalendarWatchSubscriptions(input = {}) {
  return renewCalendarWatches(input);
}

export async function listGoogleCalendarWatchSubscriptions() {
  const channels = await listCalendarWatches();
  return { channels };
}
