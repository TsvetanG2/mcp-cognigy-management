---
name: cognigy-api
description: >-
  Use whenever writing, reviewing, or debugging code that talks to the Cognigy.AI
  REST API in this repo — the rest-api-client adapter, MCP tools, fixtures, or tests.
  Encodes the correct package, auth, base URLs, the CLI, testing approach, and the
  security/licensing pitfalls so you don't guess.
---

# Calling the Cognigy.AI REST API correctly

We are building a local MCP server that manages Cognigy.AI agents. The MCP layer is a
**thin adapter** over Cognigy's official client. Full project spec: see `cognigy-mcp-server-plan.md`.

## Rule 1 — Use the official client, never hand-roll HTTP
Package (verified, scoped, actively maintained): **`@cognigy/rest-api-client`**.

```ts
import { RestAPIClient } from "@cognigy/rest-api-client";

const client = new RestAPIClient({ baseUrl: process.env.COGNIGY_BASE_URL! });

// Authenticate. Supported types: "ApiKey" | "Basic" | "OAuth2". We use ApiKey.
client.setCredentials({ type: "ApiKey", apiKey: process.env.COGNIGY_API_KEY! });
```

- Do NOT build raw `fetch`/`axios` calls to Cognigy endpoints. Wrap client methods instead.
- The client method names ARE the operations to wrap (e.g. `readFlow`, `indexProjects`, …).
  Confirm exact method names from the installed package's TypeScript types, not from memory.

## Rule 2 — Base URL is config, never hard-coded
Read from `COGNIGY_BASE_URL`. Valid hosts by environment:

| Environment | Base URL |
|---|---|
| Trial | `https://api-trial.cognigy.ai` |
| SaaS App (EU) | `https://api-app.cognigy.ai` |
| SaaS App-US | `https://api-app-us.cognigy.ai` |
| Other SaaS | `https://api-<company>.cognigy.cloud` |
| On-prem | the installation's API URL |

## Rule 3 — Auth specifics
- API key is generated in the Cognigy UI under **My Profile → API Keys**. The user brings their own.
- Raw HTTP (only relevant for fixtures/mocks, not production calls): pass the key as
  header **`X-API-Key: <key>`** (preferred) or query param `api_key=<key>`. Prefer the header.
- Keys are **agent-bound**: a key only sees projects/agents its user can access. The org-wide
  "Super API-Key" is on-prem only with a 15-min TTL — ignore it.

## Rule 4 — Verify against the live source, not memory
Cognigy's API changes per release. When unsure about an endpoint, params, or method name:
- OpenAPI spec (readable without an account): `https://api-trial.cognigy.ai/openapi`
- Docs index for agents: `https://docs.cognigy.com/llms.txt`
- API reference: `https://docs.cognigy.com/api-reference`
Fetch and check. Do not invent endpoint shapes.

## Rule 5 — Response shaping & pagination
- Many list endpoints default to **25 items**; use the `limit` query/param to change, and
  paginate — never assume a full list came back in one call.
- Tools must return **compact, shaped JSON**: strip noise, cap sizes. Agents pay tokens per result.

## Rule 6 — Mutations are conservative
- `create_*`, `update_*`, `delete_*`, `deploy_*` tools must support a `dryRun` flag and
  default to safe behavior. State the effect plainly in the tool description.

## The Cognigy CLI (reference + power tool)
Package: **`@cognigy/cognigy-cli`** (`npm i -g @cognigy/cognigy-cli`). It uses the same
rest-api-client under the hood, so it's the fastest way to learn real request patterns.

- `cognigy execute <method> -d '{...}'` runs ANY rest-api-client method
  (e.g. `cognigy execute readFlow -d '{"flowId":"<id>"}'`). Use it to discover/verify method
  names and payloads before wrapping them as tools.
- Playbooks (our testing differentiator) are runnable via the CLI: it schedules playbook runs
  from a `playbooks.json` and writes results to `playbookRunResults.json`. Mirror this in the
  testing tools.
- The CLI pulls resources to disk, lets you edit local copies, then pushes back — useful for
  Snapshot-based workflows.

## Testing without a paid account (do this by default)
1. **Mock-first:** generate types from the OpenAPI spec and run a Prism mock; build & unit-test
   every tool against it. No account needed.
2. **Fixtures:** capture real responses once, replay with `msw`/`nock` in CI.
3. **Snapshots:** a downloaded Snapshot is real agent JSON — use as offline fixtures.
4. **Trial last:** sign up at `signup.cognigy.ai` (or check existing Academy/partner access) and
   use the trial only for final smoke tests. As a certified user you may already have access.

## Security — non-negotiable
- Never log, print, or echo the API key.
- Never return secret/credential field values (e.g. from Connections) in tool output — redact.
- `.gitignore` must cover `.env`, fixtures with real keys, and Snapshots with sensitive data.

## Licensing caveat (flag, don't ignore)
`@cognigy/rest-api-client` is published under a **Cognigy Proprietary License**, not MIT/Apache.
Since this MCP is intended to be open source, treat the client as a runtime dependency the user
installs — do NOT vendor/bundle its source. Confirm redistribution terms before publishing, and
note the dependency clearly in the README. Raise this with the maintainer if anything is unclear.

## Quick links
- Client: https://www.npmjs.com/package/@cognigy/rest-api-client
- CLI: https://www.npmjs.com/package/@cognigy/cognigy-cli + https://github.com/Cognigy/Cognigy-CLI
- OpenAPI: https://api-trial.cognigy.ai/openapi
- Docs index: https://docs.cognigy.com/llms.txt
