import { BaseAdapter } from '../contracts/base.js';
import { planProjection } from '../../sync/planner/project.js';
import { buildTaskDescription } from '../../sync/google/task-input.js';

export class GoogleTasksAdapter extends BaseAdapter {
  constructor() {
    super({
      id: 'google-tasks',
      type: 'tasks',
      enabled: false,
      supportedFunctions: ['tasks', 'reports'],
      nativeFeatures: ['status-sync', 'multiple-lists'],
      metadataFieldSupport: true,
    });
  }

  normalizeInbound(payload) {
    return {
      title: payload.title || 'Untitled task',
      status: payload.status === 'completed' ? 'completed' : 'open',
      dueDate: payload.due || null,
      description: payload.notes || '',
    };
  }

  buildOutboundProjection(canonical) {
    return planProjection({ canonicalType: 'task', providerId: this.id, nativeFeatures: this.nativeFeatures, canonical });
  }

  toNativePayload(canonicalRow) {
    const metadata = JSON.parse(canonicalRow.metadata_json || '{}');
    return {
      title: canonicalRow.title,
      notes: buildTaskDescription(canonicalRow, metadata),
      due: canonicalRow.due_date ? new Date(canonicalRow.due_date).toISOString() : undefined,
      status: canonicalRow.status === 'completed' ? 'completed' : 'needsAction',
    };
  }
}
