# org-system

Scaffolded prototype for a modular organization system built around Docker Compose, n8n, org-core, PostgreSQL, Traefik, Home Assistant, optional Node-RED, and a self-rendering e-ink client.

## Included in this scaffold

- Docker Compose baseline stack
- Core service scaffolding for org-core
- Configuration UI scaffold
- E-ink client preview/hardware scaffold
- Traefik static and dynamic config scaffolding
- PostgreSQL init and migration scaffolding
- n8n workflow and forms placeholders
- Home Assistant config placeholders
- Optional Node-RED profile
- Adapter documentation placeholders
- Shared metadata format documentation
- Commented `.env.example` files

## Quick start

1. Copy `.env.example` to `.env`.
2. Review service-specific `.env.example` files.
3. Adjust domains, credentials, and paths.
4. Start the baseline stack:

```bash
cp .env.example .env
docker compose up -d --build
```

5. Baseline endpoints:
   - org-core: `http://localhost:8080/health`
   - config-ui: `http://localhost:3000`
   - e-ink preview: `http://localhost:8090/preview`
   - Traefik dashboard: disabled by default in this scaffold

## Config source modes

- `CONFIG_SOURCE=env` makes env-backed integration settings authoritative and the config UI read-only for env-backed sections.
- `CONFIG_SOURCE=web` enables DB-backed configuration via the config UI.

## Notes

- Code files intentionally avoid inline comments.
- `.env.example` files contain usage comments.
- The scaffold is organized to support modular adapters for calendar, tasks, shopping, voice, presence, and display providers.
