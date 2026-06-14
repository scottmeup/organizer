import { Router } from 'express';
import { parseMetadataBlock, serializeMetadataBlock } from '../metadata/parser.js';
import { validateMetadata } from '../metadata/validator.js';
import { projectRecurrence } from '../scheduler/recurrence/index.js';
import { buildReminderProjection } from '../scheduler/reminders/index.js';
import { adapterRegistry } from '../adapters/registry.js';

export const router = Router();

router.get('/api/config', (_req, res) => {
  res.json({ configSource: process.env.CONFIG_SOURCE || 'env', uiMode: process.env.UI_MODE || 'readonly' });
});

router.get('/api/services', (_req, res) => {
  const services = adapterRegistry.map((adapter) => adapter.describe());
  res.json({ services });
});

router.post('/api/metadata/parse', (req, res) => {
  res.json(parseMetadataBlock(String(req.body?.text || '')));
});

router.post('/api/metadata/validate', (req, res) => {
  res.json(validateMetadata(req.body || {}));
});

router.post('/api/metadata/serialize', (req, res) => {
  res.json({ text: serializeMetadataBlock(req.body || {}) });
});

router.post('/api/scheduler/preview', (req, res) => {
  res.json({ recurrence: projectRecurrence(req.body || {}), reminders: buildReminderProjection(req.body || {}) });
});

router.post('/api/barcode/intake', (req, res) => {
  const expected = process.env.BARCODE_SHARED_SECRET || '';
  const supplied = String(req.headers['x-barcode-secret'] || req.body?.secret || '');
  const authorized = expected ? supplied === expected : true;
  if (!authorized) return res.status(401).json({ ok: false, error: 'unauthorized' });
  const title = req.body?.title || req.body?.barcode || 'Scanned item';
  return res.status(201).json({ ok: true, item: { title, quantity: req.body?.quantity || 1, checked: false } });
});

router.get('/api/tasks', (_req, res) => res.json([]));
router.post('/api/tasks', (req, res) => res.status(201).json(req.body || {}));
router.get('/api/calendar/events', (_req, res) => res.json([]));
router.post('/api/calendar/events', (req, res) => res.status(201).json(req.body || {}));
router.get('/api/reports', (_req, res) => res.json([]));
router.post('/api/reports', (req, res) => res.status(201).json(req.body || {}));
router.get('/api/shopping/items', (_req, res) => res.json([]));
router.post('/api/shopping/items', (req, res) => res.status(201).json(req.body || {}));
router.get('/api/recurrence-rules', (_req, res) => res.json([]));
router.post('/api/recurrence-rules', (req, res) => res.status(201).json(req.body || {}));
router.get('/api/reminder-rules', (_req, res) => res.json([]));
router.post('/api/reminder-rules', (req, res) => res.status(201).json(req.body || {}));
router.get('/api/audit/events', (_req, res) => res.json([]));
router.get('/api/undo/entries', (_req, res) => res.json([]));
router.get('/api/sync/mappings', (_req, res) => res.json([]));
router.get('/api/display/profiles/default', (_req, res) => {
  res.json({
    profile: 'default',
    generatedAt: new Date().toISOString(),
    sections: [
      { type: 'calendar', title: 'Calendar', items: [] },
      { type: 'tasks', title: 'Tasks', items: [] },
      { type: 'shopping', title: 'Shopping', items: [] }
    ]
  });
});
