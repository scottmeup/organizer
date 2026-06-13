# org-system deep prototype

A consolidated, code-complete prototype bundle for a modular organization system built around Docker Compose, `org-core`, PostgreSQL, n8n, Traefik, Home Assistant, and an e-ink preview client.

## What this bundle prioritizes

- deep implementation of the canonical core
- persistence-backed CRUD for canonical entities
- recurrence and reminder rule storage
- metadata block parsing, validation, and serialization
- adapter implementations with real external service request paths
- n8n workflows wired to real canonical endpoints
- real-service setup instructions instead of mock-service focus

## What still requires your environment to validate

- Google OAuth credentials and consent configuration
- Home Assistant token and configured integrations
- Bring integration configured in Home Assistant
- Alexa developer console skill setup
- actual device/entity identifiers
- live webhook/domain routing via Traefik

## Quick start

```bash
cp .env.example .env
cp env-templates/providers.env.example env-templates/providers.env
cat env-templates/providers.env >> .env
docker compose up -d --build
```

## Core endpoints

- `GET /health`
- `GET /api/config`
- `GET /api/services`
- `GET /api/services/connections`
- `POST /api/services/connections`
- `GET /api/tasks`
- `GET /api/calendar/events`
- `GET /api/shopping/items`
- `GET /api/reports`
- `GET /api/recurrence-rules`
- `GET /api/reminder-rules`
- `POST /api/barcode/intake`
- `POST /api/sync/run/:providerId`
- `GET /api/audit/events`
- `GET /api/undo/entries`
- `POST /api/undo/:id/apply`
- `GET /api/display/profiles/default`
