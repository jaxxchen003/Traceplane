import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createTaskGraph,
  getTaskGraphStatus,
  registerSubtask,
  reportSubtaskResult
} from "../lib/services/task-graph";

function createFakeDb() {
  const state = {
    projects: [
      {
        id: "project-1",
        slug: "customer-pulse",
        workspaceId: "workspace-1",
        activePolicyVersion: "policy-v1"
      }
    ],
    agents: [
      { id: "agent-orchestrator", slug: "orchestrator" },
      { id: "agent-worker", slug: "worker" }
    ],
    episodes: [
      {
        id: "episode-orchestrator",
        projectId: "project-1",
        primaryAgentId: "agent-orchestrator",
        titleI18n: { zh: "编排任务", en: "Orchestrate task" },
        goalI18n: { zh: "完成重构", en: "Complete refactor" },
        successCriteriaI18n: { zh: "全部测试通过", en: "All tests pass" },
        status: "IN_PROGRESS",
        workType: "GENERATE",
        policyVersion: "policy-v1",
        startedAt: new Date("2026-04-30T00:00:00.000Z"),
        createdAt: new Date("2026-04-30T00:00:00.000Z"),
        updatedAt: new Date("2026-04-30T00:00:00.000Z")
      }
    ] as any[],
    taskGraphs: [] as any[],
    taskGraphEpisodes: [] as any[],
    episodeAgents: [] as any[],
    traceEvents: [] as any[],
    auditEvents: [] as any[],
    nodeEdges: [] as any[]
  };

  const matchesIdentity = (value: string, item: { id: string; slug?: string }) => item.id === value || item.slug === value;

  const includeEpisode = (episode: any) => {
    if (!episode) return null;
    return {
      ...episode,
      project: state.projects.find((project) => project.id === episode.projectId),
      traceEvents: state.traceEvents.filter((trace) => trace.episodeId === episode.id)
    };
  };

  const includeTaskGraph = (graph: any) => {
    if (!graph) return null;
    return {
      ...graph,
      project: state.projects.find((project) => project.id === graph.projectId),
      episodes: state.taskGraphEpisodes
        .filter((link) => link.taskGraphId === graph.id)
        .map((link) => ({
          ...link,
          episode: includeEpisode(state.episodes.find((episode) => episode.id === link.episodeId)),
          agent: state.agents.find((agent) => agent.id === link.agentId)
        }))
    };
  };

  const tx = {
    taskGraph: {
      create: vi.fn(async ({ data }) => {
        const graph = {
          id: data.id ?? `task-graph-${state.taskGraphs.length + 1}`,
          ...data,
          createdAt: new Date("2026-04-30T00:00:00.000Z"),
          updatedAt: new Date("2026-04-30T00:00:00.000Z")
        };
        state.taskGraphs.push(graph);
        return graph;
      }),
      update: vi.fn(async ({ where, data }) => {
        const graph = state.taskGraphs.find((item) => item.id === where.id);
        Object.assign(graph, data, { updatedAt: new Date("2026-04-30T00:00:00.000Z") });
        return graph;
      })
    },
    taskGraphEpisode: {
      create: vi.fn(async ({ data }) => {
        const link = {
          id: data.id ?? `task-graph-episode-${state.taskGraphEpisodes.length + 1}`,
          ...data,
          createdAt: new Date("2026-04-30T00:00:00.000Z"),
          updatedAt: new Date("2026-04-30T00:00:00.000Z")
        };
        state.taskGraphEpisodes.push(link);
        return link;
      }),
      update: vi.fn(async ({ where, data }) => {
        const link = state.taskGraphEpisodes.find((item) => item.id === where.id);
        Object.assign(link, data, { updatedAt: new Date("2026-04-30T00:00:00.000Z") });
        return link;
      })
    },
    episode: {
      create: vi.fn(async ({ data }) => {
        const episode = {
          id: data.id ?? `episode-${state.episodes.length + 1}`,
          ...data,
          createdAt: new Date("2026-04-30T00:00:00.000Z"),
          updatedAt: new Date("2026-04-30T00:00:00.000Z")
        };
        state.episodes.push(episode);
        return episode;
      }),
      update: vi.fn(async ({ where, data }) => {
        const episode = state.episodes.find((item) => item.id === where.id);
        Object.assign(episode, data, { updatedAt: new Date("2026-04-30T00:00:00.000Z") });
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
          createdAt: new Date("2026-04-30T00:00:00.000Z")
        };
        state.traceEvents.push(trace);
        return trace;
      })
    },
    auditEvent: {
      create: vi.fn(async ({ data }) => {
        const audit = { id: `audit-${state.auditEvents.length + 1}`, ...data };
        state.auditEvents.push(audit);
        return audit;
      })
    },
    nodeEdge: {
      createMany: vi.fn(async ({ data }) => {
        state.nodeEdges.push(...data);
        return { count: data.length };
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
      findUnique: vi.fn(async ({ where }) => includeEpisode(state.episodes.find((episode) => episode.id === where.id)))
    },
    taskGraph: {
      findUnique: vi.fn(async ({ where }) => {
        const graph =
          (where.id ? state.taskGraphs.find((item) => item.id === where.id) : undefined) ??
          (where.symphonyTaskId ? state.taskGraphs.find((item) => item.symphonyTaskId === where.symphonyTaskId) : undefined);
        return includeTaskGraph(graph);
      })
    },
    taskGraphEpisode: {
      findFirst: vi.fn(async ({ where }) => {
        const link = state.taskGraphEpisodes.find(
          (item) => item.taskGraphId === where.taskGraphId && item.episodeId === where.episodeId
        );
        return link ? { ...link, episode: includeEpisode(state.episodes.find((episode) => episode.id === link.episodeId)) } : null;
      })
    },
    $transaction: vi.fn(async (callback) => callback(tx))
  };

  return { db, state };
}

describe("Task Graph service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a task graph with orchestrator membership and audit evidence", async () => {
    const { db, state } = createFakeDb();

    const graph = await createTaskGraph(db as any, {
      projectId: "customer-pulse",
      symphonyTaskId: "symphony-root-1",
      orchestratorEpisodeId: "episode-orchestrator",
      createdByAgentId: "agent-orchestrator"
    });

    expect(graph).toMatchObject({
      id: "task-graph-1",
      symphony_task_id: "symphony-root-1",
      status: "running"
    });
    expect(state.taskGraphEpisodes[0]).toMatchObject({
      taskGraphId: "task-graph-1",
      episodeId: "episode-orchestrator",
      role: "ORCHESTRATOR"
    });
    expect(state.auditEvents[0]).toMatchObject({
      action: "create_task_graph",
      targetType: "task_graph",
      episodeId: "episode-orchestrator"
    });
  });

  it("registers a worker subtask as an episode attached to the graph", async () => {
    const { db, state } = createFakeDb();
    await createTaskGraph(db as any, {
      projectId: "project-1",
      symphonyTaskId: "symphony-root-1",
      orchestratorEpisodeId: "episode-orchestrator",
      createdByAgentId: "agent-orchestrator"
    });

    const subtask = await registerSubtask(db as any, {
      taskGraphId: "task-graph-1",
      agentId: "worker",
      assignedSubtask: "Update middleware tests",
      dependencyEpisodeIds: ["episode-orchestrator"],
      actorId: "agent-orchestrator"
    });

    expect(subtask).toMatchObject({
      task_graph_id: "task-graph-1",
      episode_id: "episode-2",
      role: "worker"
    });
    expect(state.episodes[1]).toMatchObject({
      id: "episode-2",
      projectId: "project-1",
      primaryAgentId: "agent-worker",
      status: "PLANNED"
    });
    expect(state.taskGraphEpisodes[1]).toMatchObject({
      episodeId: "episode-2",
      role: "WORKER",
      dependencyEpisodeIds: ["episode-orchestrator"]
    });
    expect(state.nodeEdges[0]).toMatchObject({
      fromNodeId: "episode-2",
      toNodeId: "episode-orchestrator",
      edgeType: "DEPENDS_ON"
    });
  });

  it("reports subtask results and updates aggregate status", async () => {
    const { db, state } = createFakeDb();
    await createTaskGraph(db as any, {
      projectId: "project-1",
      symphonyTaskId: "symphony-root-1",
      orchestratorEpisodeId: "episode-orchestrator",
      createdByAgentId: "agent-orchestrator"
    });
    const subtask = await registerSubtask(db as any, {
      taskGraphId: "task-graph-1",
      agentId: "agent-worker",
      assignedSubtask: "Update middleware tests"
    });

    const result = await reportSubtaskResult(db as any, {
      taskGraphId: "task-graph-1",
      episodeId: subtask.episode_id,
      status: "COMPLETED",
      summary: "Middleware tests now pass",
      actorId: "agent-worker"
    });

    expect(result).toMatchObject({
      task_graph_id: "task-graph-1",
      episode_id: subtask.episode_id,
      status: "completed"
    });
    expect(state.episodes[1].status).toBe("COMPLETED");
    expect(state.traceEvents[0]).toMatchObject({
      episodeId: subtask.episode_id,
      eventType: "symphony.subtask.result",
      status: "SUCCESS"
    });
    expect(state.taskGraphs[0].status).toBe("COMPLETED");
    expect(state.auditEvents.some((event) => event.action === "report_subtask_result")).toBe(true);
  });

  it("aggregates task graph status from worker episodes", async () => {
    const { db } = createFakeDb();
    await createTaskGraph(db as any, {
      projectId: "project-1",
      symphonyTaskId: "symphony-root-1",
      orchestratorEpisodeId: "episode-orchestrator",
      createdByAgentId: "agent-orchestrator"
    });
    await registerSubtask(db as any, {
      taskGraphId: "task-graph-1",
      agentId: "agent-worker",
      assignedSubtask: "Task A"
    });
    await registerSubtask(db as any, {
      taskGraphId: "task-graph-1",
      agentId: "agent-worker",
      assignedSubtask: "Task B"
    });
    await reportSubtaskResult(db as any, {
      taskGraphId: "task-graph-1",
      episodeId: "episode-2",
      status: "COMPLETED",
      summary: "Done"
    });

    const status = await getTaskGraphStatus(db as any, "task-graph-1");

    expect(status.status).toBe("running");
    expect(status.worker_counts).toEqual({
      total: 2,
      completed: 1,
      failed: 0,
      running: 0,
      planned: 1
    });
    expect(status.episodes).toHaveLength(3);
  });
});
