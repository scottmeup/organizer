export function getConfigMode() {
  return process.env.CONFIG_SOURCE || 'env';
}
