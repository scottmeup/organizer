import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3000);
const configSource = process.env.CONFIG_SOURCE || 'env';
const uiMode = process.env.UI_MODE || 'readonly';

app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>org-system config-ui</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #111827; color: #f9fafb; }
        .wrap { max-width: 960px; margin: 0 auto; padding: 24px; }
        .card { background: #1f2937; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
        .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #374151; }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 10px; border-bottom: 1px solid #374151; text-align: left; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <h1>org-system configuration</h1>
          <p>Configuration source: <span class="pill">${configSource}</span></p>
          <p>UI mode: <span class="pill">${uiMode}</span></p>
        </div>
        <div class="grid">
          <div class="card">
            <h2>Modules</h2>
            <table>
              <tr><th>Module</th><th>Role</th></tr>
              <tr><td>Google Calendar</td><td>Calendar adapter</td></tr>
              <tr><td>Google Tasks</td><td>Task adapter</td></tr>
              <tr><td>Google Keep</td><td>Nest shopping adapter</td></tr>
              <tr><td>Bring</td><td>Shopping adapter</td></tr>
              <tr><td>Alexa custom skill</td><td>Voice adapter</td></tr>
              <tr><td>Alexa experimental</td><td>Voice adapter</td></tr>
            </table>
          </div>
          <div class="card">
            <h2>Status</h2>
            <p>This scaffold exposes the configuration shell. Rich settings pages and live health integration are added in later implementation steps.</p>
          </div>
        </div>
      </div>
    </body>
  </html>`);
});

app.listen(port, () => {
  console.log(JSON.stringify({ service: 'config-ui', port, configSource, uiMode }));
});
