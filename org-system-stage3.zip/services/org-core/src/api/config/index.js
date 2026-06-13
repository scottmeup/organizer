import { getConfigMode } from '../../config/mode.js';
import { getFeatureFlags } from '../../config/feature-flags.js';
export async function getConfigState() { return { configSource: getConfigMode(), uiMode: process.env.UI_MODE || 'readonly', featureFlags: getFeatureFlags() }; }
