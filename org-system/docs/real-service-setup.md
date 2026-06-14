# Real Service Setup

## Google Cloud setup

1. Create OAuth client credentials.
2. Enable Google Calendar API, Google Tasks API, and Google Keep API.
3. Set the redirect URI to the value used in `env-templates/providers.env`.
4. Place the client ID and secret in `env-templates/providers.env`.

## Home Assistant setup

1. Configure Bring, Alexa-related integrations, and the desired presence entities in Home Assistant.
2. Create a long-lived access token.
3. Set `HOME_ASSISTANT_BASE_URL`, `HOME_ASSISTANT_TOKEN`, and entity IDs in `env-templates/providers.env`.

## Bring through Home Assistant

1. Add the Bring integration to Home Assistant.
2. Confirm the resulting todo entity name.
3. Set that entity name in `HOME_ASSISTANT_BRING_TODO_ENTITY`.

## Alexa custom skill setup

1. Create a custom skill in the Amazon Developer Console.
2. Point the endpoint to your public route routed to org-core or n8n.
3. Set `ALEXA_SKILL_APPLICATION_ID` and `ALEXA_SHARED_SECRET` in `env-templates/providers.env`.

## Traefik and domain

1. Point your domain to the host running Traefik.
2. Ensure only the intended webhook/UI paths are exposed.
3. Configure TLS/certificates in your real deployment.

## Testing order

1. Start the stack.
2. Verify `GET /health`.
3. Verify `GET /api/services`.
4. Create canonical tasks, events, reports, and shopping items.
5. Configure service connections or set `GOOGLE_REFRESH_TOKEN` in env (see `env-templates/providers.env.example`).
6. Trigger sync manually:

```bash
curl -X POST http://localhost:8080/api/sync/run/google-tasks -H "Content-Type: application/json" -d '{"mode":"poll"}'
curl -X POST http://localhost:8080/api/sync/run/google-calendar -H "Content-Type: application/json" -d '{"mode":"poll"}'
curl -X POST http://localhost:8080/api/sync/run/google/all -H "Content-Type: application/json" -d '{"mode":"poll"}'
```

7. Test barcode intake.
8. Test e-ink preview.
