export function buildReminderProjection(input) { const reminders = input?.reminders || {}; return { notifyBefore: reminders.notify_before || [], reRemind: reminders.re_remind || null }; }
