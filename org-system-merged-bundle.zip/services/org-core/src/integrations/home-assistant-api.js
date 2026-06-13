export async function homeAssistantGetStates() {
  const response = await fetch(`${process.env.HOME_ASSISTANT_BASE_URL}/api/states`, { headers: { Authorization: `Bearer ${process.env.HOME_ASSISTANT_TOKEN}` } });
  if (!response.ok) throw new Error('home_assistant_states_failed');
  return response.json();
}
export async function homeAssistantCallService(domain, service, data) {
  const response = await fetch(`${process.env.HOME_ASSISTANT_BASE_URL}/api/services/${domain}/${service}`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.HOME_ASSISTANT_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data || {}) });
  if (!response.ok) throw new Error('home_assistant_service_failed');
  return response.json();
}
