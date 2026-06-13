# Architecture

The stack is organized around a canonical core service (`org-core`) and modular adapters. External services are projections of canonical entities rather than the system source of truth.

## Core layers

- `org-core`: canonical state, recurrence, reminders, reports, undo, audit, sync planning
- `n8n`: orchestration, webhooks, scheduled workflows, reconciliation jobs
- `postgres`: durable state
- `home-assistant`: device and smart-home integrations
- `config-ui`: service enablement and operational interface
- `eink-client`: local rendering for display endpoints

## Adapter classes

- calendar adapters
- task adapters
- shopping adapters
- voice adapters
- presence adapters
- display adapters

## Metadata model

A shared `[orgsys]` YAML block is embedded in supported description/notes fields and synchronized with native service fields where possible.
