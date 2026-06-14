import * as serviceConnections from '../../db/repositories/entities/service-connections.js';
import { parseJson } from '../../utils/map-row.js';

function parseIdList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function buildConnection(raw = {}) {
  return {
    refreshToken: raw.refreshToken || raw.refresh_token || null,
    accessToken: raw.accessToken || raw.access_token || null,
    expiresAt: raw.expiresAt || raw.expires_at || null,
    taskListIds: parseIdList(raw.taskListIds || raw.task_list_ids),
    calendarIds: parseIdList(raw.calendarIds || raw.calendar_ids),
  };
}

export async function resolveGoogleConnection(providerId, inputConnection = {}) {
  if (inputConnection.refreshToken || inputConnection.accessToken) {
    return buildConnection(inputConnection);
  }

  if (process.env.GOOGLE_REFRESH_TOKEN || process.env.GOOGLE_ACCESS_TOKEN) {
    return buildConnection({
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: process.env.GOOGLE_ACCESS_TOKEN,
      expiresAt: process.env.GOOGLE_ACCESS_TOKEN_EXPIRES_AT,
      taskListIds: process.env.GOOGLE_TASK_LIST_IDS,
      calendarIds: process.env.GOOGLE_CALENDAR_IDS,
    });
  }

  const rows = await serviceConnections.listRows();
  const match = rows.find((row) => row.enabled && row.provider_id === providerId);
  if (!match) return null;

  return buildConnection(parseJson(match.config));
}
