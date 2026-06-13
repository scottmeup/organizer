# org-system stage 3

This package is the third implementation file set for the modular organization system.

## Added in stage 3

- canonical recurrence rule persistence and CRUD API
- canonical reminder rule persistence and CRUD API
- barcode intake webhook endpoint in `org-core`
- shopping item persistence and CRUD API
- first n8n workflow JSON placeholders for:
  - barcode webhook intake
  - task reconciliation
  - daily report trigger
  - display refresh trigger
- adapter metadata files expanded
- canonical service registry includes function capability grouping
- sample config and metadata payloads expanded

## Quick start

```bash
cp .env.example .env
docker compose up -d --build
```

## API summary

- `GET /health`
- `GET /api/config`
- `GET /api/services`
- `POST /api/metadata/parse`
- `POST /api/metadata/validate`
- `POST /api/metadata/serialize`
- `POST /api/scheduler/preview`
- `POST /api/barcode/intake`
- `GET/POST/PUT/DELETE /api/tasks`
- `GET/POST/PUT/DELETE /api/calendar/events`
- `GET/POST/PUT/DELETE /api/reports`
- `GET/POST/PUT/DELETE /api/shopping/items`
- `GET/POST/PUT/DELETE /api/recurrence-rules`
- `GET/POST/PUT/DELETE /api/reminder-rules`
