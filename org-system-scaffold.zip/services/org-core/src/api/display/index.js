export function getDisplayPayload() {
  return {
    profile: 'default',
    generatedAt: new Date().toISOString(),
    sections: [
      {
        type: 'calendar',
        title: 'Today',
        items: [
          { time: '09:00', title: 'Sample event' },
          { time: '14:00', title: 'Sample follow-up' }
        ]
      },
      {
        type: 'tasks',
        title: 'Tasks',
        items: [
          { state: 'open', title: 'Sample task' },
          { state: 'done', title: 'Completed sample' }
        ]
      }
    ]
  };
}
