# TOOLS.md — Cognigy.AI MCP Tool Catalog

Full catalog of tools for the Cognigy.AI MCP server, derived from the complete Cognigy.AI
REST API surface (~150 operations across ~30 domains). Pair with `cognigy-mcp-server-plan.md`
(spec) and `.claude/skills/cognigy-api/SKILL.md` (how to call the API).

## How to read this
- **[1:1]** — thin wrapper over a single API operation.
- **[comp]** — composite: chains several calls and/or adds logic. These are the differentiators.
- **[async]** — the underlying operation returns a **Task**; the tool must poll `getTask` to
  completion and return the final result, not "task started".
- Each tool maps to a `rest-api-client` method matching the listed REST operation. **Confirm the
  exact method name from the package's TypeScript types** before wiring (e.g. `readFlow`,
  `indexFlows`, `createNode`). The CLI trick helps: `cognigy execute <method>`.

## Global conventions (apply to every tool)
- Validate inputs with `zod`. Write each description for an LLM to choose from.
- Return compact, shaped JSON. List endpoints default to **25 items** — expose `limit` + pagination.
- Mutating tools take a `dryRun` flag and default to safe behavior.
- Never echo secret/credential values (Connections, LLM keys, Tokens). Redact.
- Pin a minimum supported Cognigy version (latest is 2026.9).

## Do NOT build (deprecated / traps)
- **States** — deprecated since 2026.7.0. Skip all State endpoints.
- **`sendMessageAsUserInput` / `sendMessageAsAiAgentOutput` (v2.0)** — deprecated. Use the
  **inject/notify** Endpoint pattern (or Playbooks) for runtime interaction instead.
- **Super API-Key** creation — on-prem only, 15-min TTL. Not for this MCP.

---

## Recommended build order

- **Phase 0 (done):** core reads — projects, flows, flow settings, latest logs.
- **Phase 1 — Inspect & interact:** Nodes (read/search), Intents (read), Endpoints (read),
  Sessions (inject/reset context), Conversations/Transcripts, Snapshots (read), Tasks.
- **Phase 2 — Author & test (the differentiators):** Node authoring, Intent/Example-sentence
  authoring, Playbooks + Assertions, NLU training/scoring, composite test & audit tools.
- **Phase 3 — Deploy & promote:** Snapshots/Packages full lifecycle, cross-environment promotion,
  snapshot diff, bulk localization.
- **Phase 4 — Configure & administer:** Connections, LLMs, NLU Connectors, Knowledge AI,
  Functions, Extensions, Handover, Users/Roles, Analytics, Audit, org-wide Search.

---

## Domain catalog

### 1. Projects
- `list_projects` [1:1] — projects in the org (paginated).
- `get_project` [1:1] — project data.
- `get_project_settings` / `update_project_settings` [1:1].
- `create_project` [1:1] / `create_project_from_template` [1:1].
- `delete_project` [1:1].
- `validate_project_name` [1:1] — name availability.
- `get_project_graph` [1:1] — graph of all resources in a project/snapshot/package (key for diffs).
- `train_flow_models` [async] — train NLU for all flows in a project.
- `generate_nlu_scores` [1:1] — score a test utterance against a flow's intents.

### 2. Flows
- `list_flows` [1:1] — supports `withAiAgents=true`.
- `get_flow` [1:1] / `update_flow` [1:1] (name/description/locale).
- `get_flow_settings` / `update_flow_settings` [1:1].
- `get_flow_chart` [1:1] — nodes/edges structure.
- `clone_flow` [1:1].
- `create_flow` [1:1] / `delete_flow` [1:1].
- `create_flow_from_child_node` [1:1] — splits a flow at a node.
- `add_locale_to_flow` / `remove_locale_from_flow` [1:1].
- `batch_flows` [1:1].

### 3. Nodes (flow authoring — high value)
- `get_nodes` / `get_node` [1:1].
- `search_nodes` [1:1] — filter nodes by word.
- `get_node_descriptors` [1:1] — available node types/blueprints.
- `create_node` [1:1] / `update_node` [1:1] / `delete_node` [1:1].
- `move_node` [1:1] — append/prepend/insert at position.
- `generate_node_output` [1:1] — Cognigy genAI generates node content (text/adaptive card).
- `add_locale_to_node` / `remove_locale_from_node` [1:1].
- `get_ai_agent_nodes` [1:1].

### 4. Intents (NLU)
- `list_intents` / `get_intent` [1:1].
- `create_intent` / `update_intent` / `delete_intent` [1:1].
- `localize_intent` / `delete_intent_localization` [1:1].
- `export_intents` [1:1] (CSV/JSON) / `upload_intents` [async] (CSV).
- `train_intents` [async].
- `batch_intents` [1:1].

### 5. Example Sentences
- `list_example_sentences` / `get_example_sentence` [1:1].
- `create_example_sentence` / `update_example_sentence` / `delete_example_sentence` [1:1].
- `generate_example_sentences` [1:1] — genAI generates training sentences for an intent.
- `batch_example_sentences` [1:1].

### 6. Lexicons & Slots
- `list_lexicons` / `get_lexicon` / `create_lexicon` / `update_lexicon` / `delete_lexicon` [1:1].
- `list_lexicon_entries` / `create_lexicon_entry` / `update_lexicon_entry` / `delete_lexicon_entry` [1:1].
- `add_keyphrase` / `update_keyphrase` / `delete_keyphrase` [1:1].
- `create_lexicon_slot` / `update_lexicon_slot` / `delete_lexicon_slot` [1:1].
- `import_lexicon` [async] / `export_lexicon` [async] (CSV).
- `batch_lexicon` / `batch_lexicons` [1:1].

### 7. Slot Fillers
- `list_slot_fillers` / `get_slot_filler` / `create_slot_filler` / `update_slot_filler` / `delete_slot_filler` [1:1].
- `batch_slot_fillers` [1:1].

### 8. Yes/No Intents
- `list_yesno_intents` / `update_yesno_intent` / `delete_yesno_intent` [1:1].
- `create_yesno_sentence` / `update_yesno_sentence` / `delete_yesno_sentence` [1:1].
- `train_yesno_intents` / `train_yesno_intents_all_locales` [async].

### 9. Locales
- `list_locales` / `get_locale` / `create_locale` / `update_locale` / `delete_locale` [1:1].

### 10. AI Agents (agentic model)
- `list_ai_agents` / `get_ai_agent` [1:1].
- `create_ai_agent` / `update_ai_agent` / `delete_ai_agent` [1:1].
- `check_ai_agent_name_availability` [1:1].
- `get_ai_agent_jobs_and_tools` [1:1].
- `list_job_market_agents` [1:1] / `hire_ai_agent` [async].

### 11. Knowledge AI (RAG)
- `list_knowledge_stores` / `get_knowledge_store` / `create_knowledge_store` / `update_knowledge_store` / `delete_knowledge_store` [1:1].
- `list_knowledge_sources` / `get_knowledge_source` / `update_knowledge_source` / `delete_knowledge_source` [1:1].
- `create_knowledge_source` [1:1] / `create_knowledge_source_from_file` [async].
- `list_knowledge_chunks` / `get_knowledge_chunk` / `create_knowledge_chunk` / `update_knowledge_chunk` / `delete_knowledge_chunk` [1:1].
- `list_knowledge_connectors` / `get_knowledge_connector` / `create_knowledge_connector` / `update_knowledge_connector` / `delete_knowledge_connector` [1:1].
- `run_knowledge_connector` [async] — extract/import from external source.
- `get_knowledge_chunk_count` [1:1] (org-wide).

### 12. Large Language Models
- `list_llms` / `get_llm` / `create_llm` / `update_llm` / `delete_llm` / `clone_llm` [1:1].
- `test_llm_connection` [1:1] — validate provider credentials.
- `get_provider_models` [1:1] — available models for a provider.

### 13. NLU Connectors
- `list_nlu_connectors` / `get_nlu_connector` / `create_nlu_connector` / `update_nlu_connector` / `delete_nlu_connector` [1:1].
- `batch_nlu_connectors` [1:1].

### 14. Endpoints & Runtime interaction
- `list_endpoints` / `get_endpoint` / `create_endpoint` / `update_endpoint` / `delete_endpoint` [1:1].
- `batch_endpoints` [1:1].
- `inject_message` [1:1] — inject a user input via the (non-deprecated) inject path.
- `notify` [1:1] — push an AI-agent output via notify.
> Use inject/notify, NOT the deprecated v2.0 send-message endpoints.

### 15. Sessions
- `inject_context` [1:1] / `reset_context` [1:1].
> Skip inject/reset State (deprecated).

### 16. Conversations & Transcripts
- `get_conversations` [1:1] — by project, optionally by contact ID.
- `get_conversation` [1:1] — by `sessionId`.
- `delete_conversation` [1:1] — use the Insights v2.1 path (v2.0 deprecated).
- `get_transcript` [comp] — assemble a readable transcript for a session.

### 17. Contact Profiles
- `list_contact_profiles` / `get_contact_profile` [1:1].
- `create_contact_profile` / `update_contact_profile` / `delete_contact_profile` [1:1].
- `delete_contact_profile_data` / `remove_contact_id` [1:1].
- `merge_contact_profiles` / `unmerge_contact_profiles` [1:1].
- `export_contact_profile` [1:1].
- `get_contact_profile_schema` / `set_contact_profile_schema` [1:1].

### 18. Connections (secrets/integrations)
- `list_connections` / `get_connection` / `create_connection` / `update_connection` / `delete_connection` [1:1].
- `get_connection_schemas` [1:1].
- `create_connection_field` / `delete_connection_field` [1:1].
- `batch_connections` [1:1].
> Redact secret field values in all outputs.

### 19. Functions
- `list_functions` / `get_function` / `create_function` / `update_function` / `delete_function` [1:1].
- `create_function_instance` [async] — run a function now.
- `list_function_instances` / `get_function_instance` / `stop_function_instance` [1:1].

### 20. Extensions
- `list_extensions` / `get_extension` / `delete_extension` [1:1].
- `upload_extension` [async] / `update_extension` [async] (file or URL).
- `update_extension_settings` [1:1] — e.g. trusted-code toggle.

### 21. Snapshots (config lifecycle)
- `list_snapshots` / `get_snapshot` [1:1].
- `get_snapshot_resources` [1:1].
- `create_snapshot` [async] / `delete_snapshot` [async].
- `package_snapshot` [async] / `upload_snapshot_package` [async].
- `create_snapshot_download_link` [1:1] / `restore_snapshot` [async].

### 22. Packages (alt resource transfer)
- `list_packages` / `get_package` [1:1].
- `create_package` [async] / `upload_package` [async] / `merge_package` [async] / `delete_package` [async].
- `create_package_download_link` [1:1].

### 23. Testing — Playbooks & Assertions (DIFFERENTIATOR)
- `list_playbooks` / `get_playbook` / `create_playbook` / `update_playbook` / `delete_playbook` [1:1].
- `create_playbook_step` / `update_playbook_step` / `delete_playbook_step` / `change_step_order` [1:1].
- `create_assertion` / `update_assertion` / `delete_assertion` [1:1].
- `schedule_playbook_run` [async] — run a playbook.
- `list_playbook_runs` / `get_playbook_run` / `delete_playbook_run` [1:1].
- `batch_playbooks` [1:1].

### 24. Tasks (async backbone)
- `get_task` [1:1] / `list_tasks` [1:1] / `cancel_task` [1:1].
> Internal helper used by every [async] tool to poll to completion.

### 25. Logs & Debug
- `get_latest_logs` [1:1] — latest ~100 entries.
- `get_logs` [1:1] (paginated, cursor) / `get_log_entry` [1:1].

### 26. Analytics / Insights
- `get_conversation_counter_metrics` (project & org) [1:1].
- `get_call_counter_metrics` (project & org) [1:1].
- `get_knowledge_query_metrics` (project & org) [1:1].
- `update_analytics_record` [1:1].
- `query_odata` [1:1] — raw OData analytics pulls.

### 27. Audit Events
- `list_audit_events` / `get_audit_event` [1:1].

### 28. Tokens
- `list_tokens` / `create_token` / `delete_token` [1:1].

### 29. Handover Providers & Services
- `list_handover_providers` / `get_handover_provider` / `create_handover_provider` / `update_handover_provider` / `delete_handover_provider` [1:1].
- `list_handover_services` / `get_handover_service` [1:1].

### 30. Users, Members & Roles
- `list_users` / `get_user` / `get_current_user_profile` [1:1].
- `list_project_members` / `add_project_member` / `update_project_member` / `remove_project_member` [1:1].
- `assign_global_role` / `unassign_global_role` [1:1].
- `assign_project_role` / `unassign_project_role` [1:1].
- `list_api_keys` / `create_api_key` / `delete_api_key` [1:1].
> Admin-heavy; gate behind explicit user intent. Avoid destructive user ops by default.

### 31. Org-wide Search
- `search_resources` [1:1] — one tool across Extensions, Projects, Lexicons, Endpoints, Flows,
  Functions, Playbooks, NLU Connectors, Snapshots, Simulations.

### 32. Voice Gateway (optional, your niche)
- `get_voice_gateway_account` [1:1].
- `get_preview_voices` [1:1] / `validate_speech_provider` [1:1].
- (Outbound call creation / call statuses exist — wrap if you target voice testing.)

---

## Composite / agentic tools (build these to stand out)

These combine the primitives above into agent-useful workflows. This is what makes the MCP more
than a generated client.

- `run_regression` [comp] — run all (or selected) Playbooks for a flow/agent, poll runs, return a
  pass/fail diff with failing assertions. Turns "is it production-ready?" into a command.
- `audit_nlu` [comp] — for a flow: intents with too few example sentences, likely-overlapping
  intents (via `generate_nlu_scores` probes), untrained models. Optionally auto-fill with
  `generate_example_sentences`.
- `score_utterance` [comp] — wrap `generate_nlu_scores`; return ranked intent matches for a phrase.
- `promote_project` [comp] — create snapshot → package → (download) → upload → restore to a target
  environment. Supports `dryRun`; tracks all [async] tasks to completion.
- `diff_snapshots` [comp] — `get_project_graph` for two snapshots/projects → human-readable change
  report (added/removed/changed flows, intents, endpoints). PR-style review for bots.
- `translate_flow` [comp] — add target locale → localize intents/nodes → trigger auto-translation.
- `find_unused_resources` [comp] — cross-reference flows/nodes against intents, lexicons,
  connections; list orphans for safe cleanup.
- `build_flow_from_outline` [comp] — given a plain-language outline, create flow + nodes
  (`create_node`/`move_node`) + `generate_node_output`. The headline "talk to build a bot" demo.
- `summarize_session` [comp] — `get_transcript` + summary of where the flow went / failed.
- `clone_agent_across_env` [comp] — snapshot/package an agent and restore into another project/env.

---

## Notes
- Treat every [async] tool as: trigger → `get_task` poll loop → return final state (with a timeout).
- Keep mutating tools behind `dryRun` and clear descriptions.
- Verify each `rest-api-client` method name against the installed TypeScript types — do not assume.
- Re-check deprecations against the live docs (`llms.txt`) before wiring older endpoints.
