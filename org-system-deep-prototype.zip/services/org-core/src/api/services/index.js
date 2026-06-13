import { adapterRegistry } from '../../adapters/registry.js';
export function getServiceRegistry() { return { services: adapterRegistry.map((adapter) => adapter.describe()) }; }
