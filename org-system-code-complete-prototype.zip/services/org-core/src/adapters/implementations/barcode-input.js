import { BaseAdapter } from '../contracts/base.js';
export class BarcodeInputAdapter extends BaseAdapter {
  constructor() { super({ id: 'barcode-input', type: 'shopping', enabled: false, supportedFunctions: ['shopping'], nativeFeatures: ['webhook-input'], metadataFieldSupport: false }); }
}
