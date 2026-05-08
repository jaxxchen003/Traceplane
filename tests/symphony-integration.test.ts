import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildOrchestratorContext,
  handleSymphonyWebhook,
  verifySymphonySignature
} from "../lib/services/symphony-integration";
import { getOrchestratorContext } from "../packages/agent-sdk/src/tools";

function signatureFor(rawBody: string, secret: string) {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

function createFakeDb() {
  const state = {
    projects: [
      {
        id: "project-1",
        slug: "customer-pulse",
        workspaceId: "workspace-1",
        activePolicyVersion: "policy-v1",
        nameI18n: { zh: "客户反馈", en: "Customer Pulse" }
      }
    ],
    agents: [
      {
        id: "agent-1",
        slug: "codex-worker"
      }
    ],
    episodes: [] as any[],
    episodeAgents: [] as any[],
    traceEvents: [] as any[],
    auditEvents: [] as any[],
    memoryItems: [] as any[],
    artifacts: [] as any[]
  };

  const matchesIdentity = (value: string, item: { id: string; slug?: string }) => {
    return item.id === value || item.slug === value;
  };

  const withIncludes = (episode: any) => {
    if (!episode) return null;
    return {
      ...episode,
      project: state.projects.find((project) => project.id === episode.projectId),
      traceEvents: state.traceEvents.filter((trace) => trace.episodeId === episode.id),
      memoryItems: state.memoryItems.filter((memory) => memory.episodeId === episode.id),
      artifacts: state.artifacts.filter((artifact) => artifact.episodeId === episode.id),
      auditEvents: state.auditEvents.filter((audit) => audit.episodeId === episode.id)
    };
  };

  const tx = {
    episode: {
      create: vi.fn(async ({ data }) => {
        const episode = {
          id: data.id ?? `episode-${state.episodes.length + 1}`,
          ...data,
          createdAt: new Date("2026-04-29T00:00:00.000Z"),
          updatedAt: new Date("2026-04-29T00:00:00.000Z")
        };
        state.episodes.push(episode);
        return episode;
      }),
      update: vi.fn(async ({ where, data }) => {
        const episode = state.episodes.find((item) => item.id === where.id);
        Object.assign(episode, data, { updatedAt: new Date("2026-04-29T00:00:00.000Z") });
        return episode;
      })
    },
    episodeAgent: {
      create: vi.fn(async ({ data }) => {
        state.episodeAgents.push(data);
        return data;
      })
    },
    traceEvent: {
      create: vi.fn(async ({ data }) => {
        const trace = {
          id: `trace-${state.traceEvents.length + 1}`,
          ...data,
          createdAt: new Date("2026-04-29T00:00:00.000Z")
        };
        state.traceEvents.push(trace);
        return trace;
      })
    },
    auditEvent: {
      create: vi.fn(async ({ data }) => {
        const audit = {
          id: `audit-${state.auditEvents.length + 1}`,
          ...data
        };
        state.auditEvents.push(audit);
        return audit;
      })
    }
  };

  const db = {
    project: {
      findFirst: vi.fn(async ({ where }) => {
        const value = where.OR[0].id ?? where.OR[1].slug;
        return state.projects.find((project) => matchesIdentity(value, project)) ?? null;
      })
    },
    agent: {
      findFirst: vi.fn(async ({ where }) => {
        const value = where.OR[0].id ?? where.OR[1].slug;
        return state.agents.find((agent) => matchesIdentity(value, agent)) ?? null;
      })
    },
    episode: {
      findUnique: vi.fn(async ({ where }) => withIncludes(state.episodes.find((episode) => episode.id === where.id)))
    },
    $transaction: vi.fn(async (callback) => callback(tx))
  };

  return { db, state };
}

describe("Symphony integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("verifies Symphony webhook HMAC signatures", () => {
    const rawBody = JSON.stringify({ event_type: "task.started", task_id: "task-1" });
    const secret = "super-secret";
    const signature = signatureFor(rawBody, secret);

    expect(verifySymphonySignature(rawBody, `sha256=${signature}`, secret)).toBe(true);
    expect(verifySymphonySignature(rawBody, signature, secret)).toBe(true);
    expect(verifySymphonySignature(rawBody, `sha256=${signature}`, "wrong-secret")).toBe(false);
    expect(verifySymphonySignature(rawBody, null, secret)).toBe(false);
  });

  it("maps task.started to an episode and audit event", async () => {
    const { db, state } = createFakeDb();

    const result = await handleSymphonyWebhook(db as any, {
      event_type: "task.started",
      orchestrator_id: "orchestrator-1",
      task_id: "symphony-task-1",
      agent_id: "codex-worker",
      payload: {
        project_id: "customer-pulse",
        title: "Refactor auth",
        goal: "Split auth routes and tests",
        success_criteria: "All auth tests pass"
      },
      timestamp: "2026-04-29T01:00:00.000Z"
    });

    expect(result.episode_id).toBe("symphony-task-1");
    expect(state.episodes[0]).toMatchObject({
      id: "symphony-task-1",
      projectId: "project-1",
      primaryAgentId: "agent-1",
      status: "IN_PROGRESS"
    });
    expect(state.auditEvents[0]).toMatchObject({
      action: "symphony.task.started",
      episodeId: "symphony-task-1",
      actorId: "orchestrator-1"
    });
  });

  it("maps task.step_completed to trace evidence and audit event", async () => {
    const { db, state } = createFakeDb();
    state.episodes.push({
      id: "symphony-task-1",
      projectId: "project-1",
      primaryAgentId: "agent-1",
      policyVersion: "policy-v1",
      status: "IN_PROGRESS",
      titleI18n: { zh: "Refactor auth", en: "Refactor auth" }
    });

    const result = await handleSymphonyWebhook(db as any, {
      event_type: "task.step_completed",
      orchestrator_id: "orchestrator-1",
      task_id: "symphony-task-1",
      agent_id: "codex-worker",
      step_index: 2,
      payload: {
        step_title: "Update middleware",
        summary: "Middleware split completed",
        tool_name: "codemod"
      },
      timestamp: "2026-04-29T01:05:00.000Z"
    });

    expect(result.trace_event_id).toBe("trace-1");
    expect(state.traceEvents[0]).toMatchObject({
      episodeId: "symphony-task-1",
      actorAgentId: "agent-1",
      stepIndex: 2,
      status: "SUCCESS",
      toolName: "codemod"
    });
    expect(state.auditEvents[0]).toMatchObject({
      action: "symphony.task.step_completed",
      traceEventId: "trace-1"
    });
  });

  it("builds orchestrator context from episode state", async () => {
    const { db, state } = createFakeDb();
    state.episodes.push({
      id: "episode-1",
      projectId: "project-1",
      primaryAgentId: "agent-1",
      policyVersion: "policy-v1",
      status: "IN_PROGRESS",
      titleI18n: { zh: "认证重构", en: "Auth refactor" },
      goalI18n: { zh: "拆分认证模块", en: "Split auth module" }
    });
    state.traceEvents.push(
      {
        id: "trace-1",
        episodeId: "episode-1",
        stepIndex: 1,
        eventType: "symphony.step",
        status: "SUCCESS",
        stepTitleI18n: { zh: "路由拆分", en: "Route split" },
        shortResultI18n: { zh: "已完成", en: "Done" },
        eventTime: new Date("2026-04-29T01:00:00.000Z")
      },
      {
        id: "trace-2",
        episodeId: "episode-1",
        stepIndex: 2,
        eventType: "symphony.step",
        status: "FAILED",
        stepTitleI18n: { zh: "测试修复", en: "Fix tests" },
        shortResultI18n: { zh: "仍有失败测试", en: "Tests still fail" },
        eventTime: new Date("2026-04-29T01:10:00.000Z")
      }
    );
    state.memoryItems.push({
      id: "memory-1",
      episodeId: "episode-1",
      titleI18n: { zh: "约束", en: "Constraint" },
      contentI18n: { zh: "不要改公开 API", en: "Do not change public APIs" },
      type: "SEMANTIC",
      source: "symphony",
      importance: 8,
      sensitivity: "Internal",
      createdAt: new Date("2026-04-29T01:02:00.000Z")
    });
    state.artifacts.push({
      id: "artifact-1",
      episodeId: "episode-1",
      artifactKey: "auth-plan",
      titleI18n: { zh: "认证计划", en: "Auth plan" },
      fileType: "MARKDOWN",
      version: 1,
      uri: "r2://auth-plan.md",
      sensitivity: "Internal",
      sourceTraceEventId: "trace-1",
      updatedAt: new Date("2026-04-29T01:03:00.000Z")
    });
    state.auditEvents.push({
      id: "audit-1",
      episodeId: "episode-1",
      action: "read_sensitive_context",
      result: "denied",
      permissionDecision: "deny",
      occurredAt: new Date("2026-04-29T01:04:00.000Z")
    });

    const context = await buildOrchestratorContext(db as any, "episode-1", "en");

    expect(context.status).toBe("active");
    expect(context.completed_steps).toHaveLength(1);
    expect(context.pending_steps).toHaveLength(1);
    expect(context.memory_snapshot[0].title).toBe("Constraint");
    expect(context.artifacts[0].artifact_key).toBe("auth-plan");
    expect(context.risk_flags).toContain("permission_denied:read_sensitive_context");
    expect(context.resume_hint).toContain("Fix tests");
  });

  it("fetches orchestrator context through the SDK helper", async () => {
    const response = {
      episode_id: "episode-1",
      status: "active",
      completed_steps: [],
      pending_steps: [],
      artifacts: [],
      memory_snapshot: [],
      risk_flags: [],
      resume_hint: "Continue"
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => response
      }))
    );

    await expect(
      getOrchestratorContext(
        { baseUrl: "http://localhost:3000", projectId: "project-1", agentId: "agent-1" },
        "episode-1"
      )
    ).resolves.toEqual(response);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/episodes/episode-1/context",
      expect.objectContaining({ method: "GET" })
    );
  });
});
