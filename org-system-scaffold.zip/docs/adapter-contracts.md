# Adapter Contracts

## Core capabilities

Every adapter declares:

- provider ID
- provider type
- supported functions
- native feature projection support
- metadata field support
- webhook support
- polling support
- voice input/output support
- presence support

## Inbound sync

- fetch changes
- normalize items
- parse metadata
- detect deletes
- detect status changes

## Outbound sync

- create external object
- update external object
- delete external object
- complete or restore object

## Projection

- project canonical to native
- project native to canonical
- compare metadata and native fields
- expose diagnostics
