import express from 'express';
const app = express();
const port = Number(process.env.PORT || 3000);
const configSource = process.env.CONFIG_SOURCE || 'env';
const uiMode = process.env.UI_MODE || 'readonly';
const orgCoreBaseUrl = process.env.ORG_CORE_BASE_URL || 'http://org-core:8080';
app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>org-system config-ui</title></head><body><h1>org-system configuration</h1><p>Configuration source: ${configSource}</p><p>UI mode: ${uiMode}</p><p>org-core base URL: ${orgCoreBaseUrl}</p></body></html>`);
});
app.listen(port, () => console.log(JSON.stringify({ service: 'config-ui', port })));
