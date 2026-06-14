# Finalized Design Specification — org-system

## 1. Purpose

org-system is a modular organization platform intended to coordinate calendars, tasks, shopping lists, reminders, reports, voice-assistant interactions, and e-ink displays through a canonical internal model and adapter-based service integrations.

The system is designed so that service providers can be added, removed, or replaced without requiring a redesign of the core logic.

## 2. Core Design Principles

### 2.1 Canonical ownership of behavior

The system owns the canonical model for:

- recurrence
- reminders
- repeat-after-completion behavior
- recurrence end conditions
- task/calendar association
- report timing and inclusion rules
- undo and audit trail
- cross-service synchronization rules

External services receive the best projection they are capable of, but they are not the source of truth for advanced behavior.

### 2.2 Modular adapter architecture

All inputs and outputs are modular.

A provider is integrated through an adapter that implements a stable internal contract. Replacing one provider with another should only require:

- adding or enabling an adapter
- configuring credentials and mapping
- selecting that adapter for the relevant function

This applies to calendar providers, task providers, shopping-list providers, voice providers, presence providers, and display providers.

### 2.3 Shared metadata format across platforms

Advanced portable behavior is represented using a shared YAML metadata block embedded in supported service description/notes fields.

The format is:

- opening marker: `[orgsys]`
- closing marker: `[/orgsys]`
- syntax: YAML
- timestamps: ISO 8601
- durations: short values such as `15m`, `2h`, `3d`, `2w`
- weekdays: `MO TU WE TH FR SA SU`

Where a service has native fields for equivalent behavior, the system must synchronize between:

- canonical internal representation
- YAML metadata block
- native provider fields

## 3. Runtime Architecture

The system is deployed with Docker Compose.

### 3.1 Baseline services

- `traefik`
- `n8n`
- `org-core`
- `postgres`
- `home-assistant`
- `eink-client`
- optional `node-red`

### 3.2 Service responsibilities

#### n8n

- public webhooks
- workflow orchestration
- scheduled polling/reconciliation jobs
- utility forms and simple browser-facing flows
- trigger and routing logic

#### org-core

- canonical domain model
- recurrence engine
- reminder engine
- report engine
- task/calendar association logic
- audit and undo
- sync mapping
- adapter registry
- metadata parsing and serialization
- display payload API

#### PostgreSQL

- canonical entities
- sync mappings
- audit history
- undo entries
- recurrence rules
- reminder rules
- report definitions
- display profiles

#### Home Assistant

- smart-home and device integration hub
- Bring integration path
- Alexa device-related integration path
- presence abstraction
- future home sensor expansion

#### Node-RED (optional)

- experimental flows
- helper and glue logic
- optional Alexa experimentation path

#### e-ink client

- local rendering
- PC preview mode
- pull display payload from org-core
- render locally on target hardware

## 4. Supported Functional Domains

### 4.1 Inputs

The architecture supports modular input providers for:

- voice input
- calendar input
- task-list input
- shopping-list input
- barcode/mobile input
- presence input
- manual/browser input

### 4.2 Outputs

The architecture supports modular output providers for:

- calendar output
- task output
- shopping-list output
- voice/audio output
- reports
- e-ink display output

## 5. Core Canonical Entities

The canonical model includes:

- task
- calendar_event
- shopping_item
- recurrence_rule
- reminder_rule
- report_definition
- sync_mapping
- audit_event
- undo_entry
- linked_item
- display_profile
- service_connection

## 6. Metadata Block Specification

Example:

```text
[orgsys]
kind: task
title_mode: external
schedule:
  type: recurring
  repeat:
    mode: after_completion
    freq: monthly
    interval: 1
    byday: [MO]
    bysetpos: [1]
    end:
      type: count
      count: 12
  time: "09:00"
reminders:
  re_remind:
    enabled: true
    every: "6h"
    until: completed
  notify_before:
    - "1d"
    - "2h"
links:
  create_calendar_event: true
reports:
  include: true
display:
  include: true
[/orgsys]
```

### 6.1 Recurrence end types

Supported values:

- `never`
- `count`
- `duration`
- `until`

## 7. Scheduling and Recurrence

The canonical scheduler supports:

- every `n` minutes
- every `n` hours
- every `n` days
- every `n` weeks
- every `n` months
- multiple times per day
- fixed calendar-based recurrence
- repeat-after-last-completion behavior
- explicit end conditions

The scheduler also supports reminder projections such as:

- notify before due/start
- repeated reminders until completion
- task/calendar association-dependent scheduling

## 8. Synchronization Rules

### 8.1 Source of truth

The canonical model is authoritative.

### 8.2 Projection model

External services receive the best projection they can represent.

### 8.3 Conflict handling

When both the metadata block and provider-native fields can represent the same behavior:

- both sides are normalized into a common internal representation
- changes are compared to previously known sync state
- if only one side changed, that side wins
- if both changed and conflict, most-recently-changed wins
- the previous state is recorded in audit and undo history

### 8.4 Loop prevention

Each sync mapping tracks:

- canonical type
- canonical ID
- provider ID
- remote ID
- metadata hash
- native hash
- last source
- timestamps

## 9. Undo and Audit

Every create, update, and delete action should produce:

- an audit event
- an undo entry

Undo is implemented as a compensating action, not as a transaction rollback.

## 10. Reports

The system supports multiple report definitions.

Each report can define:

- report time
- included sections
- device targets
- fallback targets
- presence requirements
- give-up time and behavior
- day/range selection rules

## 11. Configuration Model

Two supported authoritative modes:

- `CONFIG_SOURCE=env`
- `CONFIG_SOURCE=web`

### 11.1 env mode

When env mode is active:

- env-backed integration settings are authoritative
- the web UI must hide or disable editing for env-backed settings
- read-only operational and diagnostic pages may still be available

### 11.2 web mode

When web mode is active:

- integration configuration is stored in the database
- the configuration UI is authoritative

## 12. Security and Exposure Model

Traefik should expose only the required public surfaces.

n8n is expected to run behind Traefik with reverse-proxy-aware settings.

Administrative and internal service endpoints should remain on the Docker network unless explicitly intended for exposure.

## 13. E-ink Display Requirements

The display system must support:

- PC-based preview and prototyping
- local rendering on the display device
- no dependency on a separate image-generation machine for routine operation
- configurable sections and display profiles

## 14. Approved Service/Adapter Strategy

### 14.1 Included in the design

- Google Calendar adapter
- Google Tasks adapter
- Google Keep adapter
- Bring adapter
- Alexa custom skill adapter
- Alexa experimental adapter
- barcode input adapter
- display adapter
- presence abstraction through adapter design

### 14.2 Node-RED

Node-RED is optional and allowed as an auxiliary integration layer, but not as the canonical core.

## 15. Why the implementation has been proceeding in stages

The implementation has been proceeding in staged file sets instead of jumping directly to a claimed full working prototype for all features at once for three practical reasons:

1. The system has a high feature surface area spanning canonical scheduling, multiple synchronization domains, audit/undo, UI modes, e-ink rendering, public webhook handling, and several adapter classes. A staged build avoids producing a large but brittle codebase that would likely need major rework once the core sync and recurrence assumptions are exercised.

2. Some provider paths are intentionally higher-risk or less direct than others, especially adapters involving unofficial or evolving integration approaches. Building the canonical engine, sync mapping layer, and audit/undo foundation first reduces the chance of hard-coding fragile assumptions into the core.

3. The design-spec phase explicitly mattered because architecture changes later would be costly. The staged approach has been used to preserve the chosen architecture while progressively adding concrete file sets without changing direction.

The intended end state is still a cohesive full prototype, but the file sets have been structured to build toward that safely rather than skipping foundation layers.

## 16. Current Status Baseline

At the design level, the architecture is finalized around:

- Docker Compose deployment
- canonical `org-core`
- adapter-based modular integrations
- shared YAML metadata block
- env/web config modes
- self-rendering e-ink clients
- optional Node-RED
- Home Assistant included

This document is the finalized design specification baseline for continuing implementation.
