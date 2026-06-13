import { Router } from 'express';
import { parseMetadataBlock, serializeMetadataBlock } from '../metadata/parser.js';
import { getDisplayPayload } from '../api/display/index.js';
import { getServiceRegistry } from '../api/services/index.js';

export const router = Router();

router.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

router.get('/api/services', (_req, res) => {
  res.json(getServiceRegistry());
});

router.get('/api/display/profiles/default', (_req, res) => {
  res.json(getDisplayPayload());
});

router.post('/api/metadata/parse', (req, res) => {
  const input = String(req.body?.text || '');
  res.json(parseMetadataBlock(input));
});

router.post('/api/metadata/serialize', (req, res) => {
  res.json({ text: serializeMetadataBlock(req.body || {}) });
});
