import { BaseAdapter } from '../contracts/base.js';
export class GoogleCalendarAdapter extends BaseAdapter { constructor() { super({ id: 'google-calendar', type: 'calendar', enabled: false, supportedFunctions: ['calendar','reminders','reports'], nativeFeatures: ['recurrence','watch','reminder-overrides'], metadataFieldSupport: true }); } }
