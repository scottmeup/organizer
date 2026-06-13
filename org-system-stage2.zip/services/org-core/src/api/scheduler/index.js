import { projectRecurrence } from '../../scheduler/recurrence/index.js';
import { buildReminderProjection } from '../../scheduler/reminders/index.js';
export function previewRecurrence(input) { return { recurrence: projectRecurrence(input), reminders: buildReminderProjection(input) }; }
