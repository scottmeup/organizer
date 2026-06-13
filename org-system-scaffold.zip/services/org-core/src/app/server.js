import express from 'express';
import { getConfigMode } from '../config/mode.js';
import { metadataSample } from '../metadata/schemas/sample.js';
import { router } from './routes.js';

const app = express();
const port = Number(process.env.PORT || 8080);

app.use(express.json({ limit: '1mb' }));
app.use(router);

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'org-core',
    configSource: getConfigMode(),
    metadataSample
  });
});

app.listen(port, () => {
  console.log(JSON.stringify({ service: 'org-core', port }));
});
