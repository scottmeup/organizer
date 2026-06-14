import { GoogleCalendarAdapter } from './implementations/google-calendar.js';
import { GoogleTasksAdapter } from './implementations/google-tasks.js';
import { GoogleKeepAdapter } from './implementations/google-keep.js';
import { BringAdapter } from './implementations/bring.js';
import { BarcodeInputAdapter } from './implementations/barcode-input.js';
import { DisplayAdapter } from './implementations/display.js';
import { AlexaCustomSkillAdapter } from './implementations/alexa-custom-skill.js';
import { AlexaExperimentalAdapter } from './implementations/alexa-experimental.js';
export const adapterRegistry = [new GoogleCalendarAdapter(), new GoogleTasksAdapter(), new GoogleKeepAdapter(), new BringAdapter(), new BarcodeInputAdapter(), new DisplayAdapter(), new AlexaCustomSkillAdapter(), new AlexaExperimentalAdapter()];
