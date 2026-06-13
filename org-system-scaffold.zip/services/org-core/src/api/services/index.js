export function getServiceRegistry() {
  return {
    configSource: process.env.CONFIG_SOURCE || 'env',
    services: [
      { id: 'google-calendar', type: 'calendar', enabled: false },
      { id: 'google-tasks', type: 'tasks', enabled: false },
      { id: 'google-keep', type: 'shopping', enabled: false },
      { id: 'bring', type: 'shopping', enabled: false },
      { id: 'alexa-custom-skill', type: 'voice', enabled: false },
      { id: 'alexa-experimental', type: 'voice', enabled: false },
      { id: 'presence', type: 'presence', enabled: false },
      { id: 'display', type: 'display', enabled: true }
    ]
  };
}
