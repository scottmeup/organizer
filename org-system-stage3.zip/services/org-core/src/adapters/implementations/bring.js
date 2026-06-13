import { BaseAdapter } from '../contracts/base.js';
export class BringAdapter extends BaseAdapter { constructor() { super({ id: 'bring', type: 'shopping', enabled: false, supportedFunctions: ['shopping'], nativeFeatures: ['shared-lists'], metadataFieldSupport: false }); } }
