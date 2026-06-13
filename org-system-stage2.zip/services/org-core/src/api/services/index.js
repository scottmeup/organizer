import { adapterRegistry } from '../../adapters/registry.js';
export function getServiceRegistry() { return { configSource: process.env.CONFIG_SOURCE || 'env', services: adapterRegistry.map((adapter) => adapter.describe()) }; }
