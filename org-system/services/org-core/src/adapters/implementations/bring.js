import { BaseAdapter } from '../contracts/base.js';
import { planProjection } from '../../sync/planner/project.js';
export class BringAdapter extends BaseAdapter {
  constructor() { super({ id: 'bring', type: 'shopping', enabled: false, supportedFunctions: ['shopping'], nativeFeatures: ['shared-lists'], metadataFieldSupport: false }); }
  normalizeInbound(payload) { return { title: payload.name || payload.title || 'Untitled item', quantity: payload.quantity || 1, checked: payload.checked || false }; }
  buildOutboundProjection(canonical) { return planProjection({ canonicalType: 'shopping_item', providerId: this.id, nativeFeatures: this.nativeFeatures, canonical }); }
}
