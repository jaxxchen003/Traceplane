# Enterprise Preview

This document outlines features in Traceplane that are currently available in the open source version but may become part of a future commercial Enterprise offering.

## Understanding the Markers

### ✅ Core (MIT License)
These features are permanently open source under the MIT License and will always remain free:
- Episode CRUD operations
- Basic Trace, Memory, and Artifact management
- Agent SDK (Node.js)
- Real-time Event Stream (SSE)
- Basic audit logging
- Simple access control

### 🚫 Enterprise Preview
These features are currently available but marked for potential future commercial licensing:
- Advanced audit analytics and compliance reporting
- Role-Based Access Control (RBAC)
- Vector search and semantic retrieval
- SSO/SAML integration
- Data retention policies
- Advanced storage options

## Feature Classification

### Audit & Compliance

| Feature | Status | Notes |
|---------|--------|-------|
| Basic audit query | ✅ Core | `GET /api/audit` - Simple event listing |
| Compliance reports | 🚫 Preview | SOC2, HIPAA report generation |
| Audit analytics | 🚫 Preview | Trend analysis, dashboards |
| Export (PDF/CSV) | 🚫 Preview | Compliance documentation |

### Access Control

| Feature | Status | Notes |
|---------|--------|-------|
| Basic access grants | ✅ Core | `POST /api/access` - Simple permissions |
| RBAC roles | 🚫 Preview | Complex role hierarchies |
| Field-level permissions | 🚫 Preview | Granular data access |
| SSO/SAML | 🚫 Preview | Enterprise identity providers |

### Context & Search

| Feature | Status | Notes |
|---------|--------|-------|
| Basic context query | ✅ Core | `POST /api/context` - Simple retrieval |
| Vector semantic search | 🚫 Preview | AI-powered similarity search |
| RAG integration | 🚫 Preview | Retrieval-Augmented Generation |
| Smart recommendations | 🚫 Preview | ML-based suggestions |

### Storage

| Feature | Status | Notes |
|---------|--------|-------|
| SQLite local storage | ✅ Core | Default development setup |
| Local file storage | ✅ Core | Artifact storage |
| Managed cloud storage | 🚫 Preview | S3/R2 managed integration |
| Automatic backups | 🚫 Preview | Scheduled backups |
| Encryption at rest | 🚫 Preview | Enterprise security |

## Timeline

- **v0.1.0 (Current)**: All features open source
- **v0.5.0 (Planned)**: Introduce Enterprise Preview features
- **v1.0.0 (Planned)**: Enterprise features in commercial offering

## What This Means for Users

### For Open Source Users
- Core functionality is and will remain free
- You can self-host indefinitely
- Community contributions welcome
- MIT License guarantees freedom

### For Enterprise Users
- Commercial licenses will be available
- Premium support options
- SLA guarantees
- Advanced security features

## Questions?

If you have questions about licensing or Enterprise features:
- Open a [Discussion](../../discussions)
- Contact: hello@traceplane.io

## Commitment to Open Source

Traceplane is committed to maintaining a robust open source core. The Enterprise offering will be additive - providing additional features rather than restricting existing functionality.
