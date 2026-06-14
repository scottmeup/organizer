# Bundle status

Consolidated status for the `org-system` tree after merging iteration bundles.

## Completed and wired

- Docker Compose stack: traefik, postgres, org-core, config-ui, eink-client, n8n, home-assistant, optional node-red
- PostgreSQL schema (9 migrations): core entities, sync mappings, reports, display profiles, audit/undo, linked items, schedule rules, shopping items, undo status
- org-core HTTP server with full REST surface
- Metadata block parse / validate / serialize
- Scheduler preview (basic recurrence and reminder projection)
- Task and calendar CRUD with audit events and compensating undo
- Sync mapping repository and conflict resolver scaffolding
- Adapter registry with partial implementations for Google Calendar, Google Tasks, Bring, Google Keep
- Google OAuth and Calendar/Tasks API integration modules with pull/push sync orchestration
- Home Assistant API integration module
- config-ui with env-mode read-only proxy
- e-ink client PC preview pulling display payload from org-core
- n8n workflow JSON for barcode, display refresh, Google Tasks/Calendar sync ticks, reconciliation, reports

## Partially implemented

- **Recurrence engine** — basic frequency only; missing after-completion, weekday/bysetpos rules, end conditions from spec §6–7
- **Reminder engine** — projection stub only; no scheduled execution or re-remind loop
- **Provider sync** — Google Calendar supports poll + push (`events.watch`); Google Tasks remains poll-only (no Google push API)
- **Reports** — CRUD and sample payload; no timed delivery, presence gating, or voice output
- **Display profiles** — hardcoded default payload; DB table exists but not fully used
- **Shopping items** — CRUD without audit/undo or cross-service sync
- **Config UI** — diagnostic shell only; web-mode editing not implemented
- **Alexa / barcode / presence adapters** — stubs and docs only

## Not yet started

- Presence adapter implementation
- Linked-items API and task/calendar association logic
- Node-RED Alexa experimental flows wired to org-core
- Hardware e-ink rendering path (Inky Impression etc.)
- Full env/web config mode enforcement in UI

## Next recommended steps

1. Extend sync to Bring via Home Assistant and Google Keep
2. Extend `calc-next.js` for after-completion and end-condition recurrence
3. Add audit/undo to shopping and report mutations
4. Implement web-mode service connection editing in config-ui
5. Integration testing with real Google and Bring credentials
