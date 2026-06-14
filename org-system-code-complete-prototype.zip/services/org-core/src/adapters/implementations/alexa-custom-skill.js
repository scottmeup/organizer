import { BaseAdapter } from '../contracts/base.js';
export class AlexaCustomSkillAdapter extends BaseAdapter {
  constructor() { super({ id: 'alexa-custom-skill', type: 'voice', enabled: false, supportedFunctions: ['voice-input','voice-output','reminders'], nativeFeatures: ['skill','reminders'], metadataFieldSupport: false }); }
}
