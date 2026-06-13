import { calculateNextOccurrence } from './calc-next.js';
export function projectRecurrence(input) { return { nextOccurrence: calculateNextOccurrence(input), mode: input?.repeat?.mode || 'fixed' }; }
