# org-system stage 4

This package is the fourth implementation file set for the modular organization system.

## Added in stage 4

- provider-specific adapter skeletons with sync methods for:
  - Google Calendar
  - Google Tasks
  - Bring
- canonical sync-mapping repository and CRUD helpers
- canonical audit-event and undo-entry repositories
- org-core CRUD APIs now create audit events
- initial sync planner helpers and provider projection helpers
- n8n reconciliation workflow placeholders expanded to include sync mapping reads/writes
- adapter docs expanded with implementation notes and sample payloads

## Quick start

```bash
cp .env.example .env
docker compose up -d --build
```

## Notable APIs

- `GET /api/services`
- `GET /api/audit/events`
- `GET /api/undo/entries`
- `GET /api/sync/mappings`
- task/calendar/report/shopping CRUD APIs
- recurrence/reminder rule CRUD APIs
- barcode intake webhook
