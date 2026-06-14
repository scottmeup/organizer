export async function listGoogleCalendars(accessToken) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('google_calendar_list_failed');
  return response.json();
}

export async function listGoogleCalendarEvents(accessToken, calendarId, options = {}) {
  return listGoogleCalendarEventsPage(accessToken, calendarId, options);
}

export async function listGoogleCalendarEventsPage(accessToken, calendarId, { syncToken, pageToken } = {}) {
  const params = new URLSearchParams({ singleEvents: 'true' });
  if (syncToken) {
    params.set('syncToken', syncToken);
  } else {
    params.set('orderBy', 'startTime');
  }
  if (pageToken) params.set('pageToken', pageToken);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (response.status === 410) {
    const error = new Error('google_calendar_sync_token_expired');
    error.code = 'SYNC_TOKEN_EXPIRED';
    throw error;
  }
  if (!response.ok) throw new Error('google_calendar_events_failed');
  return response.json();
}

export async function listAllGoogleCalendarEvents(accessToken, calendarId, { syncToken } = {}) {
  const items = [];
  let pageToken;
  let nextSyncToken = syncToken || null;

  do {
    const page = await listGoogleCalendarEventsPage(accessToken, calendarId, { syncToken: pageToken ? undefined : nextSyncToken, pageToken });
    items.push(...(page.items || []));
    pageToken = page.nextPageToken || null;
    if (page.nextSyncToken) nextSyncToken = page.nextSyncToken;
  } while (pageToken);

  return { items, nextSyncToken };
}

export async function watchGoogleCalendarEvents(accessToken, calendarId, body) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/watch`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) throw new Error('google_calendar_watch_failed');
  return response.json();
}

export async function stopGoogleWatchChannel(accessToken, body) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/channels/stop', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok && response.status !== 404) throw new Error('google_calendar_watch_stop_failed');
  return response.ok;
}

export async function createGoogleCalendarEvent(accessToken, calendarId, body) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) throw new Error('google_calendar_create_failed');
  return response.json();
}

export async function updateGoogleCalendarEvent(accessToken, calendarId, eventId, body) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) throw new Error('google_calendar_update_failed');
  return response.json();
}
