import { resolveConflict } from '../conflict/resolve.js';
import { hashCalendarCanonical, hashCalendarNative } from '../util/hash.js';
import { buildEventInputFromRemote } from './event-input.js';
import * as mappingRepo from '../../db/repositories/sync-mappings.js';
import {
  deleteCalendarEventRow,
  getCalendarEventRow,
  insertCalendarEventRow,
  listCalendarEventRows,
  updateCalendarEventRow,
} from '../../db/repositories/calendar-events.js';
import {
  createGoogleCalendarEvent,
  listAllGoogleCalendarEvents,
  updateGoogleCalendarEvent,
} from '../../integrations/google-calendar-api.js';

const PROVIDER_ID = 'google-calendar';
const CANONICAL_TYPE = 'calendar_event';

export async function resolveCalendarIds(_accessToken, connection) {
  if (connection.calendarIds?.length) return connection.calendarIds;
  return ['primary'];
}

export function buildCalendarWebhookUrl() {
  if (process.env.GOOGLE_CALENDAR_WEBHOOK_URL) {
    return process.env.GOOGLE_CALENDAR_WEBHOOK_URL;
  }
  const domain = process.env.ORGSYS_DOMAIN;
  if (!domain) return null;
  const protocol = process.env.GOOGLE_CALENDAR_WEBHOOK_PROTOCOL || 'https';
  return `${protocol}://${domain}/api/webhooks/google/calendar`;
}

async function reconcileRemoteEvent({ remote, adapter, stats }) {
  if (remote.status === 'cancelled') {
    const mapping = await mappingRepo.findMappingByRemote(PROVIDER_ID, CANONICAL_TYPE, remote.id);
    if (!mapping) {
      stats.skipped += 1;
      return;
    }
    await deleteCalendarEventRow(mapping.canonical_id);
    await mappingRepo.deleteSyncMappingByRemote(PROVIDER_ID, CANONICAL_TYPE, remote.id);
    stats.pulled += 1;
    return;
  }

  const mapping = await mappingRepo.findMappingByRemote(PROVIDER_ID, CANONICAL_TYPE, remote.id);
  const nativeHash = hashCalendarNative(remote);
  const input = buildEventInputFromRemote(adapter, remote);

  if (!mapping) {
    const created = await insertCalendarEventRow(input);
    await mappingRepo.upsertSyncMappingRow({
      canonicalType: CANONICAL_TYPE,
      canonicalId: created.id,
      providerId: PROVIDER_ID,
      remoteId: remote.id,
      metadataHash: hashCalendarCanonical(created),
      nativeHash,
      lastSource: 'remote',
    });
    stats.pulled += 1;
    return;
  }

  const canonical = await getCalendarEventRow(mapping.canonical_id);
  if (!canonical) {
    stats.skipped += 1;
    return;
  }

  const canonicalHash = hashCalendarCanonical(canonical);
  const remoteChanged = nativeHash !== mapping.native_hash;
  const canonicalChanged = canonicalHash !== mapping.metadata_hash;

  if (!remoteChanged && !canonicalChanged) {
    stats.skipped += 1;
    return;
  }

  let updatedRow = canonical;
  let lastSource = mapping.last_source;

  if (remoteChanged && !canonicalChanged) {
    updatedRow = await updateCalendarEventRow(canonical.id, input);
    lastSource = 'remote';
    stats.pulled += 1;
  } else if (remoteChanged && canonicalChanged) {
    const winner = resolveConflict({
      leftUpdatedAt: canonical.updated_at,
      rightUpdatedAt: remote.updated,
    });
    if (winner === 'right') {
      updatedRow = await updateCalendarEventRow(canonical.id, input);
      lastSource = 'remote';
      stats.pulled += 1;
    } else {
      stats.skipped += 1;
    }
  } else {
    stats.skipped += 1;
  }

  await mappingRepo.upsertSyncMappingRow({
    canonicalType: CANONICAL_TYPE,
    canonicalId: updatedRow.id,
    providerId: PROVIDER_ID,
    remoteId: remote.id,
    metadataHash: hashCalendarCanonical(updatedRow),
    nativeHash,
    lastSource,
  });
}

async function pushCanonicalEvent({ canonical, accessToken, adapter, stats, defaultCalendarId, calendarIdByRemote }) {
  const mapping = await mappingRepo.findMappingByCanonical(PROVIDER_ID, CANONICAL_TYPE, canonical.id);
  const canonicalHash = hashCalendarCanonical(canonical);
  const calendarId = mapping ? (calendarIdByRemote.get(mapping.remote_id) || defaultCalendarId) : defaultCalendarId;

  if (!mapping) {
    const nativeBody = adapter.toNativePayload(canonical);
    const created = await createGoogleCalendarEvent(accessToken, defaultCalendarId, nativeBody);
    await mappingRepo.upsertSyncMappingRow({
      canonicalType: CANONICAL_TYPE,
      canonicalId: canonical.id,
      providerId: PROVIDER_ID,
      remoteId: created.id,
      metadataHash: canonicalHash,
      nativeHash: hashCalendarNative(created),
      lastSource: 'canonical',
    });
    stats.pushed += 1;
    return;
  }

  if (canonicalHash === mapping.metadata_hash) {
    stats.skipped += 1;
    return;
  }

  const shouldPush = mapping.last_source === 'canonical'
    || new Date(canonical.updated_at).getTime() > new Date(mapping.updated_at).getTime();

  if (!shouldPush) {
    stats.skipped += 1;
    return;
  }

  const nativeBody = adapter.toNativePayload(canonical);
  const updated = await updateGoogleCalendarEvent(accessToken, calendarId, mapping.remote_id, nativeBody);
  await mappingRepo.upsertSyncMappingRow({
    canonicalType: CANONICAL_TYPE,
    canonicalId: canonical.id,
    providerId: PROVIDER_ID,
    remoteId: mapping.remote_id,
    metadataHash: canonicalHash,
    nativeHash: hashCalendarNative(updated),
    lastSource: 'canonical',
  });
  stats.pushed += 1;
}

async function pullCalendarEventPage({ accessToken, calendarId, adapter, syncToken, stats, calendarIdByRemote }) {
  try {
    const { items, nextSyncToken } = await listAllGoogleCalendarEvents(accessToken, calendarId, { syncToken });
    for (const remote of items) {
      if (remote.status !== 'cancelled') {
        calendarIdByRemote.set(remote.id, calendarId);
      }
      try {
        await reconcileRemoteEvent({ remote: { ...remote, _calendarId: calendarId }, adapter, stats });
      } catch (error) {
        stats.errors.push({ remoteId: remote.id, error: error.message || String(error) });
      }
    }
    return { nextSyncToken, reset: false };
  } catch (error) {
    if (error.code !== 'SYNC_TOKEN_EXPIRED') throw error;
    const { items, nextSyncToken } = await listAllGoogleCalendarEvents(accessToken, calendarId, { syncToken: null });
    for (const remote of items) {
      if (remote.status !== 'cancelled') {
        calendarIdByRemote.set(remote.id, calendarId);
      }
      try {
        await reconcileRemoteEvent({ remote: { ...remote, _calendarId: calendarId }, adapter, stats });
      } catch (innerError) {
        stats.errors.push({ remoteId: remote.id, error: innerError.message || String(innerError) });
      }
    }
    return { nextSyncToken, reset: true };
  }
}

export async function pullGoogleCalendarChanges({ accessToken, calendarId, adapter, syncToken = null }) {
  const stats = { pulled: 0, pushed: 0, skipped: 0, errors: [] };
  const calendarIdByRemote = new Map();
  const result = await pullCalendarEventPage({
    accessToken,
    calendarId,
    adapter,
    syncToken,
    stats,
    calendarIdByRemote,
  });
  return { stats, nextSyncToken: result.nextSyncToken, reset: result.reset, calendarIdByRemote };
}

export async function syncGoogleCalendar({ accessToken, connection, adapter, direction = 'both' }) {
  const stats = { pulled: 0, pushed: 0, skipped: 0, errors: [] };
  const calendarIds = await resolveCalendarIds(accessToken, connection);

  if (!calendarIds.length) {
    return { ...stats, errors: [{ error: 'no_calendars_available' }] };
  }

  const defaultCalendarId = calendarIds[0];
  const calendarIdByRemote = new Map();

  if (direction !== 'push') {
    for (const calendarId of calendarIds) {
      try {
        const result = await pullGoogleCalendarChanges({ accessToken, calendarId, adapter, syncToken: null });
        stats.pulled += result.stats.pulled;
        stats.skipped += result.stats.skipped;
        stats.errors.push(...result.stats.errors);
        for (const [remoteId, mappedCalendarId] of result.calendarIdByRemote.entries()) {
          calendarIdByRemote.set(remoteId, mappedCalendarId);
        }
      } catch (error) {
        stats.errors.push({ calendarId, error: error.message || String(error) });
      }
    }
  }

  if (direction === 'pull') {
    return stats;
  }

  const canonicalEvents = await listCalendarEventRows();
  for (const canonical of canonicalEvents) {
    try {
      await pushCanonicalEvent({
        canonical,
        accessToken,
        adapter,
        stats,
        defaultCalendarId,
        calendarIdByRemote,
      });
    } catch (error) {
      stats.errors.push({ canonicalId: canonical.id, error: error.message || String(error) });
    }
  }

  return stats;
}
