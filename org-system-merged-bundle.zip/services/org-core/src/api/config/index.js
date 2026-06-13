export async function getConfigState() { return { configSource: process.env.CONFIG_SOURCE || 'env', uiMode: process.env.UI_MODE || 'readonly' }; }
