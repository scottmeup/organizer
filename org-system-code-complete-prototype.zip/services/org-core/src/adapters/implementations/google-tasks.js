import { BaseAdapter } from '../contracts/base.js';
export class GoogleTasksAdapter extends BaseAdapter {
  constructor() { super({ id: 'google-tasks', type: 'tasks', enabled: false, supportedFunctions: ['tasks','reports'], nativeFeatures: ['status-sync','multiple-lists'], metadataFieldSupport: true }); }
  normalizeInbound(payload) { return { title: payload.title || 'Untitled task', status: payload.status || 'open', dueDate: payload.due || null, description: payload.notes || '' }; }
}
