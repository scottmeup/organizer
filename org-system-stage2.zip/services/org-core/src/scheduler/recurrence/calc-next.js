function addDays(date, count) { const next = new Date(date); next.setUTCDate(next.getUTCDate() + count); return next; }
function addMonths(date, count) { const next = new Date(date); next.setUTCMonth(next.getUTCMonth() + count); return next; }
export function calculateNextOccurrence(input) {
  const base = new Date(input.baseDate || input.lastDate || new Date().toISOString());
  const repeat = input.repeat || {};
  const interval = Number(repeat.interval || 1);
  const freq = repeat.freq || 'daily';
  if (freq === 'minutes') return new Date(base.getTime() + interval * 60 * 1000).toISOString();
  if (freq === 'hours') return new Date(base.getTime() + interval * 60 * 60 * 1000).toISOString();
  if (freq === 'daily') return addDays(base, interval).toISOString();
  if (freq === 'weekly') return addDays(base, interval * 7).toISOString();
  if (freq === 'monthly') return addMonths(base, interval).toISOString();
  return addDays(base, interval).toISOString();
}
