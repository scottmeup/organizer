import { BaseAdapter } from '../contracts/base.js';
import { planProjection } from '../../sync/planner/project.js';
export class GoogleCalendarAdapter extends BaseAdapter {
  constructor() { super({ id: 'google-calendar', type: 'calendar', enabled: false, supportedFunctions: ['calendar','reminders','reports'], nativeFeatures: ['recurrence','watch','reminder-overrides'], metadataFieldSupport: true }); }
  normalizeInbound(payload) { return { title: payload.summary || payload.title || 'Untitled event', startsAt: payload.start?.dateTime || payload.startsAt || null, endsAt: payload.end?.dateTime || payload.endsAt || null, description: payload.description || '' }; }
  buildOutboundProjection(canonical) { return planProjection({ canonicalType: 'calendar_event', providerId: this.id, nativeFeatures: this.nativeFeatures, canonical }); }
}
