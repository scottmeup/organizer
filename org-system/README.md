# org-system

Consolidated implementation of the modular organization platform described in `docs/finalized-design-spec.md`.

This tree merges the best pieces from the staged iteration bundles:

- **stage 4** — canonical domain model, sync mapping, audit/undo, adapters, migrations
- **deep prototype** — HTTP app wiring, Google/Home Assistant integration modules, provider sync API
- **stage 3** — config-ui and e-ink client with org-core display pull
- **scaffold** — full Docker Compose stack including Home Assistant and optional Node-RED

## Quick start

```bash
cp .env.example .env
# edit .env with your domain, postgres password, and provider credentials

docker compose up -d --build
```

Optional Node-RED profile:

```bash
docker compose --profile nodered up -d
```

## Service endpoints (via Traefik)

| Path | Service |
|------|---------|
| `/api/*` | org-core canonical API |
| `/ui/*` | config-ui (read-only when `CONFIG_SOURCE=env`) |
| `/display/*` | e-ink preview client |
| `/webhook/*` | n8n public webhooks |

Direct ports (local dev):

- org-core: `8080`
- config-ui: `3000`
- e-ink-client: `8090`
- n8n editor: `5678`

## Core APIs

- `GET /health` — service and database readiness
- `GET /api/config` — config source and feature flags
- CRUD for tasks, calendar events, shopping items, reports, recurrence/reminder rules
- `GET /api/audit/events`, `GET /api/undo/entries`, `POST /api/undo/:id/apply`
- `GET /api/sync/mappings`, `POST /api/sync/run/:providerId`, `POST /api/sync/run/google/all`
- `POST /api/sync/watch/google-calendar/register`, `POST /api/sync/watch/google-calendar/renew`, `GET /api/sync/watch/google-calendar`
- `POST /api/webhooks/google/calendar` (Google Calendar push notifications)
- `GET /api/display/profiles/default`
- `POST /api/barcode/intake`

## Configuration

- `CONFIG_SOURCE=env` — integration settings from `.env`; config-ui is read-only
- `CONFIG_SOURCE=web` — integration settings stored in PostgreSQL (UI editing planned)

Provider credential templates: `env-templates/providers.env.example`

Real service setup notes: `docs/real-service-setup.md`

## n8n workflows

Bundled under `n8n/workflows/`:

- barcode intake
- display refresh tick
- task reconciliation tick (runs Google sync batch)
- daily report trigger
- Google Tasks sync tick
- Google Calendar sync tick
- Google Calendar watch renew tick
- Google sync all tick (Tasks + Calendar)

Import or mount these into your n8n instance and configure credentials.

## Current implementation status

See `docs/bundle-status.md` for an honest gap list relative to the full design spec.

**Working now:** Docker stack, PostgreSQL migrations, canonical CRUD, metadata parse/validate, scheduler preview, audit trail, compensating undo for tasks/calendar, display payload API, e-ink PC preview, config-ui proxy, adapter registry, Google Tasks poll sync, Google Calendar poll + push webhook sync, Google/HA integration clients.

**Still to build:** advanced recurrence (after-completion, byday, end conditions), reminder execution engine, report delivery to voice devices, presence adapter, web-mode config UI, linked-items API, Bring/Keep sync, hardware e-ink path.

## Development

```bash
cd services/org-core
npm install
DATABASE_URL=postgresql://orgsys:change_me@localhost:5432/orgsys npm start
```
