import { getPool } from '../client.js';

export async function listWatchChannelRows() {
  return (await getPool().query('select * from google_calendar_watch_channels order by expiration asc')).rows;
}

export async function getWatchChannelByChannelId(channelId) {
  return (await getPool().query(
    'select * from google_calendar_watch_channels where channel_id = $1',
    [channelId]
  )).rows[0] || null;
}

export async function getWatchChannelByCalendarId(calendarId) {
  return (await getPool().query(
    'select * from google_calendar_watch_channels where calendar_id = $1',
    [calendarId]
  )).rows[0] || null;
}

export async function upsertWatchChannelRow(input) {
  const existing = await getWatchChannelByCalendarId(input.calendarId);
  if (existing) {
    return (await getPool().query(
      `update google_calendar_watch_channels
       set channel_id=$2, resource_id=$3, expiration=$4, webhook_token=$5, sync_token=$6, updated_at=now()
       where id=$1 returning *`,
      [existing.id, input.channelId, input.resourceId, input.expiration, input.webhookToken || null, input.syncToken || null]
    )).rows[0];
  }
  return (await getPool().query(
    `insert into google_calendar_watch_channels(calendar_id, channel_id, resource_id, expiration, webhook_token, sync_token)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [input.calendarId, input.channelId, input.resourceId, input.expiration, input.webhookToken || null, input.syncToken || null]
  )).rows[0];
}

export async function updateWatchChannelSyncToken(channelId, syncToken) {
  return (await getPool().query(
    'update google_calendar_watch_channels set sync_token=$2, updated_at=now() where channel_id=$1 returning *',
    [channelId, syncToken || null]
  )).rows[0] || null;
}

export async function deleteWatchChannelByCalendarId(calendarId) {
  return (await getPool().query(
    'delete from google_calendar_watch_channels where calendar_id = $1 returning *',
    [calendarId]
  )).rows[0] || null;
}

export async function listExpiringWatchChannelRows(withinMs) {
  const withinHours = Math.max(1, Math.ceil(withinMs / (60 * 60 * 1000)));
  return (await getPool().query(
    "select * from google_calendar_watch_channels where expiration <= now() + ($1 || ' hours')::interval order by expiration asc",
    [String(withinHours)]
  )).rows;
}
