import { BaseAdapter } from '../contracts/base.js';
export class GoogleKeepAdapter extends BaseAdapter { constructor() { super({ id: 'google-keep', type: 'shopping', enabled: false, supportedFunctions: ['shopping','notes'], nativeFeatures: ['checklist'], metadataFieldSupport: true }); } }
