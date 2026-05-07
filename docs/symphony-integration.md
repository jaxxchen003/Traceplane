# Symphony Integration

Traceplane treats Symphony as an external orchestration runtime. Symphony emits task
events; Traceplane persists them as episode-first work graph evidence so an
orchestrator can resume from structured context instead of replaying chat logs.

## Integration Goals

- Convert Symphony runtime events into Traceplane `Episode`, `TraceEvent`, and
  `AuditEvent` records.
- Preserve a machine-readable recovery context for the orchestrator.
- Represent multi-worker Symphony tasks as durable Traceplane Task Graphs.
- Keep every accepted write tied to an episode and audit trail.

## Webhook Endpoint

`POST /api/webhooks/symphony`

The endpoint requires `SYMPHONY_WEBHOOK_SECRET` and verifies
`x-symphony-signature` using HMAC-SHA256 over the raw request body. The header may
be either a raw 64-character hex digest or `sha256=<digest>`.

Supported events:

| Event | Traceplane effect |
| --- | --- |
| `task.started` | Creates or reuses an Episode anchored to `task_id` |
| `task.step_completed` | Appends a TraceEvent snapshot to the Episode |
| `task.failed` | Marks the Episode `FAILED` and records failure context |
| `task.completed` | Marks the Episode `COMPLETED` and records final outcome |

Minimal `task.started` payload:

```json
{
  "event_type": "task.started",
  "orchestrator_id": "symphony-orchestrator",
  "task_id": "task_123",
  "agent_id": "research-agent",
  "timestamp": "2026-04-30T10:00:00.000Z",
  "payload": {
    "project_id": "q2-customer-pulse",
    "title": "Analyze customer feedback",
    "goal": "Summarize churn risks",
    "success_criteria": "Produce a manager-readable brief"
  }
}
```

## Orchestrator Context

`GET /api/episodes/{id}/context`

Returns machine-readable continuation state for an orchestrator:

- normalized episode status
- completed and pending trace steps
- recent memory snapshot
- recent artifacts and source trace links
- risk flags from failed traces, denied permissions, or policy hits
- resume hint

The Agent SDK exposes the same capability through `get_orchestrator_context`.

## Task Graph Support

Task Graphs model one orchestrated Symphony task and all worker subtasks as
episode-backed graph nodes.

REST endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/task-graphs` | Create a Task Graph for a project and orchestrator Episode |
| `GET /api/task-graphs/{id}/status` | Return aggregate worker counts and graph status |

MCP tools:

| Tool | Purpose |
| --- | --- |
| `register_subtask` | Create a worker Episode and attach it to a Task Graph |
| `report_subtask_result` | Update worker Episode status, append trace evidence, and refresh graph status |
| `get_task_graph_status` | Query aggregate graph progress for orchestration decisions |

## Current Boundaries

- No separate Symphony runtime client is bundled yet.
- Task Graph visualization is not implemented in the UI.
- Fork/replay requests are intentionally left for a later phase.
- Auth and tenant-aware permission enforcement must be added before public SaaS use.

## Verification

Targeted checks:

```bash
npx vitest run tests/symphony-integration.test.ts tests/task-graph.test.ts
npx prisma validate --schema prisma/schema.prisma
npx prisma validate --schema prisma/schema.postgres.prisma
npm run lint
npm run build
```
