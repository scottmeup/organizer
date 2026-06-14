import { BaseAdapter } from '../contracts/base.js';
import { planProjection } from '../../sync/planner/project.js';
import { buildEventDescription } from '../../sync/google/event-input.js';

export class GoogleCalendarAdapter extends BaseAdapter {
  constructor() {
    super({
      id: 'google-calendar',
      type: 'calendar',
      enabled: false,
      supportedFunctions: ['calendar', 'reminders', 'reports'],
      nativeFeatures: ['recurrence', 'watch', 'reminder-overrides'],
      metadataFieldSupport: true,
    });
  }

  normalizeInbound(payload) {
    return {
      title: payload.summary || payload.title || 'Untitled event',
      startsAt: payload.start?.dateTime || payload.start?.date || payload.startsAt || null,
      endsAt: payload.end?.dateTime || payload.end?.date || payload.endsAt || null,
      description: payload.description || '',
    };
  }

  buildOutboundProjection(canonical) {
    return planProjection({ canonicalType: 'calendar_event', providerId: this.id, nativeFeatures: this.nativeFeatures, canonical });
  }

  toNativePayload(canonicalRow) {
    const metadata = JSON.parse(canonicalRow.metadata_json || '{}');
    const startsAt = canonicalRow.starts_at ? new Date(canonicalRow.starts_at).toISOString() : null;
    const endsAt = canonicalRow.ends_at ? new Date(canonicalRow.ends_at).toISOString() : startsAt;
    return {
      summary: canonicalRow.title,
      description: buildEventDescription(canonicalRow, metadata),
      start: startsAt ? { dateTime: startsAt } : undefined,
      end: endsAt ? { dateTime: endsAt } : undefined,
    };
  }
}
