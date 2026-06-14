import { adapterRegistry } from '../../adapters/registry.js';
export function getServiceRegistry() {
  const services = adapterRegistry.map((adapter) => adapter.describe());
  const groups = {
    calendar: services.filter((s) => s.type === 'calendar'),
    tasks: services.filter((s) => s.type === 'tasks'),
    shopping: services.filter((s) => s.type === 'shopping'),
    voice: services.filter((s) => s.type === 'voice'),
    display: services.filter((s) => s.type === 'display')
  };
  return { configSource: process.env.CONFIG_SOURCE || 'env', services, groups };
}
