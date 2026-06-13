import { listTaskRows } from '../../db/repositories/tasks.js';
import { listCalendarEventRows } from '../../db/repositories/calendar-events.js';
export async function getDisplayPayload() {
  const tasks = await listTaskRows();
  const events = await listCalendarEventRows();
  return {
    profile: 'default',
    generatedAt: new Date().toISOString(),
    sections: [
      { type: 'calendar', title: 'Calendar', items: events.slice(0,5).map((i) => ({ time: i.starts_at, title: i.title })) },
      { type: 'tasks', title: 'Tasks', items: tasks.slice(0,5).map((i) => ({ state: i.status, title: i.title })) }
    ]
  };
}
