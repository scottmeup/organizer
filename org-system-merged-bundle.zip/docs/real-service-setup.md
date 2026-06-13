# Real Service Setup

1. Create `.env` from `.env.example` and fill the root/system values.
2. Create `env-templates/providers.env` from `env-templates/providers.env.example` and fill provider credentials.
3. Choose your deployment mode:
   - `docker-compose.standalone.yml`
   - `docker-compose.external-traefik.yml`
   - `docker-compose.external-traefik-external-n8n.yml`
4. Start the selected stack.
5. Verify `GET /health` and `GET /api/services`.
6. Add service connection entries through `POST /api/services/connections`.
7. Validate provider-specific routing and sync behavior.
