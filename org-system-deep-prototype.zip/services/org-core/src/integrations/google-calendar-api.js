export async function listGoogleCalendars(accessToken) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('google_calendar_list_failed');
  return response.json();
}
export async function listGoogleCalendarEvents(accessToken, calendarId) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('google_calendar_events_failed');
  return response.json();
}
export async function createGoogleCalendarEvent(accessToken, calendarId, body) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error('google_calendar_create_failed');
  return response.json();
}
