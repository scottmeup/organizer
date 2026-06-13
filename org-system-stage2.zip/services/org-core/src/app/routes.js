import { Router } from 'express';
import { parseMetadataBlock, serializeMetadataBlock } from '../metadata/parser.js';
import { validateMetadata } from '../metadata/validator.js';
import { getConfigState } from '../api/config/index.js';
import { getServiceRegistry } from '../api/services/index.js';
import { getDisplayPayload } from '../api/display/index.js';
import { listTasks, createTask, getTask, updateTask, deleteTask } from '../api/tasks/index.js';
import { listCalendarEvents, createCalendarEvent, getCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../api/calendar/index.js';
import { listReports, createReport, getReport, updateReport, deleteReport } from '../api/reports/index.js';
import { previewRecurrence } from '../api/scheduler/index.js';

export const router = Router();

router.get('/api/config', async (_req, res) => res.json(await getConfigState()));
router.get('/api/services', (_req, res) => res.json(getServiceRegistry()));
router.get('/api/display/profiles/default', async (_req, res) => res.json(await getDisplayPayload()));
router.post('/api/metadata/parse', (req, res) => res.json(parseMetadataBlock(String(req.body?.text || ''))));
router.post('/api/metadata/validate', (req, res) => res.json(validateMetadata(req.body || {})));
router.post('/api/metadata/serialize', (req, res) => res.json({ text: serializeMetadataBlock(req.body || {}) }));
router.post('/api/scheduler/preview', (req, res) => res.json(previewRecurrence(req.body || {})));

router.get('/api/tasks', async (_req, res) => res.json(await listTasks()));
router.post('/api/tasks', async (req, res) => res.status(201).json(await createTask(req.body || {})));
router.get('/api/tasks/:id', async (req, res) => {
  const item = await getTask(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});
router.put('/api/tasks/:id', async (req, res) => {
  const item = await updateTask(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});
router.delete('/api/tasks/:id', async (req, res) => res.json({ ok: await deleteTask(req.params.id) }));

router.get('/api/calendar/events', async (_req, res) => res.json(await listCalendarEvents()));
router.post('/api/calendar/events', async (req, res) => res.status(201).json(await createCalendarEvent(req.body || {})));
router.get('/api/calendar/events/:id', async (req, res) => {
  const item = await getCalendarEvent(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});
router.put('/api/calendar/events/:id', async (req, res) => {
  const item = await updateCalendarEvent(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});
router.delete('/api/calendar/events/:id', async (req, res) => res.json({ ok: await deleteCalendarEvent(req.params.id) }));

router.get('/api/reports', async (_req, res) => res.json(await listReports()));
router.post('/api/reports', async (req, res) => res.status(201).json(await createReport(req.body || {})));
router.get('/api/reports/:id', async (req, res) => {
  const item = await getReport(req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});
router.put('/api/reports/:id', async (req, res) => {
  const item = await updateReport(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ error: 'not_found' });
  res.json(item);
});
router.delete('/api/reports/:id', async (req, res) => res.json({ ok: await deleteReport(req.params.id) }));
