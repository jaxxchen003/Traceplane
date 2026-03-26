# Claude Code Project Guidance

This repository exposes an MCP server for Traceplane.

When working in this project:

1. Treat `Episode` as the primary work unit.
2. Prefer creating a new episode for a new business goal, new deliverable, or new review flow.
3. Query context before generating a major result.
4. Record key facts with `write_memory`.
5. Record key steps, decisions, and exceptions with `append_trace`.
6. Register final outputs with `create_artifact`.
7. Update the episode status when the work stage genuinely changes.
8. Link episodes when the relationship is clear:
   - `DEPENDS_ON`
   - `REVIEWS`
   - `SUPERSEDES`
   - `CONTINUES`
   - `SPLITS_FROM`
   - `REFERENCES`

This system is not a chat log sink. It is a work graph and evidence chain.
