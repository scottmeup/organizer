# org-system code-complete prototype bundle

This bundle consolidates the current prototype structure into one package that includes the core subsystems and implementation surfaces discussed in the finalized design specification.

## Included subsystem areas

- Docker Compose runtime
- Traefik scaffold
- canonical org-core service scaffold
- PostgreSQL migration set
- config UI scaffold
- e-ink preview client scaffold
- adapter registry and provider adapter skeletons
- barcode intake path
- recurrence/reminder rule APIs
- task/calendar/report/shopping APIs
- n8n workflow placeholders
- finalized design spec

## Important status note

This is a code-complete prototype bundle in the sense that the required subsystem boundaries, routes, configurations, and integration surfaces are represented in one package.

External-provider paths still require real credentials, live accounts, and runtime validation before they can be called fully verified end-to-end.
