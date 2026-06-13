import express from 'express';
import { router } from './routes.js';
import { ensureDatabase } from '../db/bootstrap.js';
import { getConfigMode } from '../config/mode.js';
import { metadataSample } from '../metadata/schemas/sample.js';

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(express.json({ limit: '1mb' }));
app.use(router);

app.get('/health', async (_req, res) => {
  res.json({
    ok: true,
    configSource: getConfigMode(),
    databaseReady: await ensureDatabase(),
    metadataSample
  });
});

app.listen(port, async () => {
  await ensureDatabase();
  console.log(JSON.stringify({ service: 'org-core', port }));
});
