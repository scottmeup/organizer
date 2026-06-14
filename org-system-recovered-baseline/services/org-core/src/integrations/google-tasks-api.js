export async function listGoogleTaskLists(accessToken) {
  const response = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('google_tasklists_failed');
  return response.json();
}
export async function listGoogleTasks(accessToken, tasklistId) {
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks`, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('google_tasks_failed');
  return response.json();
}
export async function createGoogleTask(accessToken, tasklistId, body) {
  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error('google_task_create_failed');
  return response.json();
}
