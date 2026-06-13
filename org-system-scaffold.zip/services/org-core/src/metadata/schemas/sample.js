export const metadataSample = {
  kind: 'task',
  title_mode: 'external',
  schedule: {
    type: 'recurring',
    repeat: {
      mode: 'after_completion',
      freq: 'monthly',
      interval: 1,
      byday: ['MO'],
      bysetpos: [1],
      end: { type: 'count', count: 12 }
    },
    time: '09:00'
  },
  reminders: {
    re_remind: {
      enabled: true,
      every: '6h',
      until: 'completed'
    },
    notify_before: ['1d', '2h']
  },
  links: {
    create_calendar_event: true
  },
  reports: {
    include: true
  },
  display: {
    include: true
  }
};
