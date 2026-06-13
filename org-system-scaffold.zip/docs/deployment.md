# Deployment

## Baseline

1. Copy `.env.example` to `.env`.
2. Review service-specific `.env.example` files.
3. Build and start:

```bash
docker compose up -d --build
```

## Optional Node-RED

```bash
docker compose --profile nodered up -d --build
```

## Config source modes

- `CONFIG_SOURCE=env`
- `CONFIG_SOURCE=web`
