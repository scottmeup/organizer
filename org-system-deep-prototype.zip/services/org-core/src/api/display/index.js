import * as taskRepo from '../../db/repositories/entities/tasks.js';
import * as eventRepo from '../../db/repositories/entities/calendar-events.js';
import * as shoppingRepo from '../../db/repositories/entities/shopping-items.js';
export async function getDisplayPayload() {
  const tasks = await taskRepo.listRows();
  const events = await eventRepo.listRows();
  const shopping = await shoppingRepo.listRows();
  return {
    profile: process.env.DISPLAY_DEFAULT_PROFILE || 'default',
    generatedAt: new Date().toISOString(),
    sections: [
      { type: 'calendar', title: 'Calendar', items: events.slice(0, 8).map((item) => ({ time: item.starts_at, title: item.title })) },
      { type: 'tasks', title: 'Tasks', items: tasks.slice(0, 8).map((item) => ({ state: item.status, title: item.title })) },
      { type: 'shopping', title: 'Shopping', items: shopping.slice(0, 8).map((item) => ({ checked: item.checked, title: item.title })) }
    ]
  };
}
