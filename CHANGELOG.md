# Changelog

All notable changes to Traceplane will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-04-20

### Added

#### Core Platform
- **Episode Management** - Create, track, and manage multi-agent work episodes with full lifecycle support (PLANNED → IN_PROGRESS → COMPLETED/FAILED)
- **Trace Reporting** - Real-time trace event ingestion via REST API
- **Memory System** - Persistent context storage scoped to episodes and agents
- **Artifact Management** - Create and retrieve work artifacts (documents, reports, outputs)
- **Handoff Brief** - Auto-generate structured handoff documents for agent transitions
- **Surgical Replay** - Fork episodes from any node; snapshot and diff agent state

#### Agent SDK (`@traceplane/agent-sdk`)
- `TraceplaneSDK` client with session-based API
- `startEpisode()`, `step()`, `toolUse()`, `complete()`, `fail()` methods
- Real-time SSE event subscription
- Automatic error capture and batch reporting support
- Full TypeScript types

#### REST API
- `POST /api/episodes` - Create episode
- `PATCH /api/episodes/{id}/status` - Update episode status
- `POST /api/episodes/fork` - Fork episode
- `POST /api/traces` - Append trace
- `POST/GET /api/memory` - Memory CRUD
- `POST /api/artifacts` - Create artifact
- `GET /api/events/stream` - SSE real-time event stream

#### MCP Tools
- `create_episode`, `update_episode_status`, `append_trace`
- `write_memory`, `create_artifact`, `get_episode_brief`

#### Integrations
- Claude Code (SDK + MCP)
- OpenCode (SDK + MCP)
- Gemini CLI (SDK + MCP)
- Custom Agent (SDK)

#### UI Dashboard
- Project overview with metrics cards and episode table
- Episode timeline with trace event visualization
- Real-time event stream panel (SSE)
- Audit trail with full operation log
- i18n support (zh/en)

#### Infrastructure
- Docker deployment support
- Railway deployment config
- GitHub Actions CI/CD
- Prisma ORM with cloud database support

### Known Limitations
- Python SDK not yet available (planned)
- Webhook triggers not yet available (planned)

---

## [Unreleased]

### Planned
- Python SDK
- Webhook event triggers
- Dashboard analytics enhancements
