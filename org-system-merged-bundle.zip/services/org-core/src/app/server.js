import express from 'express';
import { router } from './routes.js';
import { ensureDatabase } from '../db/bootstrap.js';

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(express.json({ limit: '1mb' }));
app.use(router);

app.get('/health', async (_req, res) => {
  const databaseReady = await ensureDatabase();
  res.json({ ok: true, service: 'org-core', configSource: process.env.CONFIG_SOURCE || 'env', databaseReady });
});

app.listen(port, async () => {
  await ensureDatabase();
  console.log(JSON.stringify({ service: 'org-core', port }));
});
