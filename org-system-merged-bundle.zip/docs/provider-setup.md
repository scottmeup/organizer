# Provider Setup Instructions

## Google Calendar / Tasks / Keep

1. Create/choose a Google Cloud project.
2. Enable the needed APIs.
3. Configure OAuth consent.
4. Create an OAuth client.
5. Put the values into `env-templates/providers.env`.

## Home Assistant

1. Create a long-lived access token.
2. Identify the Bring, presence, and optional Alexa-related entities.
3. Put the values into `env-templates/providers.env`.

## Alexa custom skill

1. Create a custom skill in the Amazon Developer Console.
2. Configure the endpoint to your routed org-system/n8n endpoint.
3. Put the values into `env-templates/providers.env`.
