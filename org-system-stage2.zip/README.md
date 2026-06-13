# org-system stage 2

This package is the second implementation file set for the modular organization system.

## Included

- Docker Compose runtime scaffold
- org-core PostgreSQL-backed API scaffold
- config-ui browser shell
- e-ink preview client
- Home Assistant and Node-RED placeholders
- adapter placeholders and first org-core adapter registry
- shared metadata block support
- recurrence and reminder projection skeleton

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
- `GET/POST/PUT/DELETE /api/tasks`
- `GET/POST/PUT/DELETE /api/calendar/events`
- `GET/POST/PUT/DELETE /api/reports`
