# Integrating with an Existing Traefik Installation

Use `docker-compose.external-traefik.yml` if you want this bundle to reuse your current Traefik.

Set:

- `EXISTING_TRAEFIK_NETWORK`
- `TRAEFIK_DOCKER_NETWORK`

Then ensure your existing Traefik watches Docker and that the org-system routable containers join the same external network.
