export async function ensureGoogleAccessToken(connection) {
  if (connection.accessToken && connection.expiresAt && new Date(connection.expiresAt).getTime() > Date.now() + 60000) {
    return connection.accessToken;
  }
  if (!connection.refreshToken) {
    return connection.accessToken || null;
  }
  const params = new URLSearchParams();
  params.set('client_id', process.env.GOOGLE_CLIENT_ID || '');
  params.set('client_secret', process.env.GOOGLE_CLIENT_SECRET || '');
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', connection.refreshToken);
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
  if (!response.ok) {
    return null;
  }
  const payload = await response.json();
  return payload.access_token || null;
}
