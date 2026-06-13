import { BaseAdapter } from '../contracts/base.js';
export class DisplayAdapter extends BaseAdapter { constructor() { super({ id: 'display', type: 'display', enabled: true, supportedFunctions: ['display','reports'], nativeFeatures: ['local-render','pc-preview'], metadataFieldSupport: false }); } }
