import express from 'express';
const app = express();
const port = Number(process.env.PORT || 3000);
const configSource = process.env.CONFIG_SOURCE || 'env';
const uiMode = process.env.UI_MODE || 'readonly';
const orgCoreBaseUrl = process.env.ORG_CORE_BASE_URL || 'http://org-core:8080';
app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>org-system config-ui</title><style>body{font-family:Arial,sans-serif;margin:0;background:#111827;color:#f9fafb}.wrap{max-width:1080px;margin:0 auto;padding:24px}.card{background:#1f2937;border-radius:16px;padding:20px;margin-bottom:16px}.pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#374151}a{color:#93c5fd}</style></head><body><div class="wrap"><div class="card"><h1>org-system configuration</h1><p>Configuration source: <span class="pill">${configSource}</span></p><p>UI mode: <span class="pill">${uiMode}</span></p><p>org-core base URL: <span class="pill">${orgCoreBaseUrl}</span></p><ul><li><a href="/proxy/config">/proxy/config</a></li><li><a href="/proxy/services">/proxy/services</a></li><li><a href="/proxy/tasks">/proxy/tasks</a></li><li><a href="/proxy/calendar/events">/proxy/calendar/events</a></li><li><a href="/proxy/reports">/proxy/reports</a></li><li><a href="/proxy/shopping/items">/proxy/shopping/items</a></li><li><a href="/proxy/recurrence-rules">/proxy/recurrence-rules</a></li><li><a href="/proxy/reminder-rules">/proxy/reminder-rules</a></li></ul></div></div></body></html>`);
});
app.get('/proxy/*', async (req, res) => {
  const target = `${orgCoreBaseUrl}/api/${req.params[0] || ''}`;
  const response = await fetch(target);
  const text = await response.text();
  res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
});
app.listen(port, () => console.log(JSON.stringify({ service: 'config-ui', port, configSource, uiMode })));
