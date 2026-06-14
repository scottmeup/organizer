export class BaseAdapter {
  constructor(input) {
    this.id = input.id;
    this.type = input.type;
    this.enabled = input.enabled ?? false;
    this.supportedFunctions = input.supportedFunctions || [];
    this.nativeFeatures = input.nativeFeatures || [];
    this.metadataFieldSupport = input.metadataFieldSupport || false;
  }
  describe() {
    return {
      id: this.id,
      type: this.type,
      enabled: this.enabled,
      supportedFunctions: this.supportedFunctions,
      nativeFeatures: this.nativeFeatures,
      metadataFieldSupport: this.metadataFieldSupport
    };
  }
}
