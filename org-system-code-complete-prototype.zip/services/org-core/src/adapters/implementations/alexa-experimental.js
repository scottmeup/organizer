import { BaseAdapter } from '../contracts/base.js';
export class AlexaExperimentalAdapter extends BaseAdapter {
  constructor() { super({ id: 'alexa-experimental', type: 'voice', enabled: false, supportedFunctions: ['voice-input','shopping'], nativeFeatures: ['experimental'], metadataFieldSupport: false }); }
}
