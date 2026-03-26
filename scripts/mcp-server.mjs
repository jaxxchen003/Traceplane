import { PrismaClient } from "@prisma/client";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

const prisma = new PrismaClient();

function toI18n(value, fallback = null) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    return { zh: trimmed, en: trimmed };
  }

  if (value && typeof value === "object" && typeof value.zh === "string") {
    return {
      zh: value.zh.trim(),
      en: typeof value.en === "string" && value.en.trim() ? value.en.trim() : value.zh.trim()
    };
  }

  return fallback;
}

function localize(value, locale = "zh") {
  if (!value || typeof value !== "object") return "";
  return value[locale] ?? value.zh ?? value.en ?? "";
}

function jsonText(data) {
  return JSON.stringify(data, null, 2);
}

function toolResult(data) {
  return {
    content: [
      {
        type: "text",
        text: jsonText(data)
      }
    ],
    structuredContent: data
  };
}

const server = new McpServer({
  name: "enterprise-agent-work-graph",
  version: "1.1.0"
});

server.registerTool(
  "create_episode",
  {
    description: "Create a new episode under a project using the episode-first work graph model.",
    inputSchema: {
      project_id: z.string(),
      primary_agent_id: z.string(),
      goal: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]),
      work_type: z.enum(["RESEARCH", "GENERATE", "REVIEW", "REVISE", "APPROVE", "SUMMARIZE"]),
      success_criteria: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]),
      title: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      summary: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      primary_actor: z.string().optional(),
      relation_intent: z
        .enum(["DEPENDS_ON", "REVIEWS", "SUPERSEDES", "CONTINUES", "SPLITS_FROM", "REFERENCES"])
        .optional(),
      target_episode_id: z.string().optional(),
      policy_version: z.string().optional()
    }
  },
  async ({
    project_id,
    primary_agent_id,
    goal,
    work_type,
    success_criteria,
    title,
    summary,
    primary_actor,
    relation_intent,
    target_episode_id,
    policy_version
  }) => {
    const project = await prisma.project.findUnique({ where: { id: project_id } });

    if (!project) {
      throw new Error("Project not found");
    }

    const created = await prisma.$transaction(async (tx) => {
      const episode = await tx.episode.create({
        data: {
          projectId: project_id,
          primaryAgentId: primary_agent_id,
          titleI18n: toI18n(title, toI18n(goal)),
          summaryI18n: toI18n(summary),
          goalI18n: toI18n(goal),
          successCriteriaI18n: toI18n(success_criteria),
          primaryActor: primary_actor ?? null,
          workType: work_type,
          relationIntent: relation_intent ?? null,
          status: "PLANNED",
          policyVersion: policy_version ?? project.activePolicyVersion,
          startedAt: new Date()
        }
      });

      await tx.episodeAgent.create({
        data: {
          episodeId: episode.id,
          agentId: primary_agent_id
        }
      });

      if (target_episode_id && relation_intent) {
        await tx.nodeEdge.create({
          data: {
            fromNodeType: "episode",
            fromNodeId: episode.id,
            toNodeType: "episode",
            toNodeId: target_episode_id,
            edgeType: relation_intent
          }
        });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          episodeId: episode.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: primary_agent_id,
          action: "create_episode",
          targetType: "episode",
          targetId: episode.id,
          result: "success",
          policyVersion: policy_version ?? project.activePolicyVersion,
          permissionDecision: "allow"
        }
      });

      return episode;
    });

    return toolResult({
      episode_id: created.id,
      status: created.status,
      work_type: created.workType,
      relation_intent: created.relationIntent
    });
  }
);

server.registerTool(
  "update_episode_status",
  {
    description: "Update the lifecycle status of an episode.",
    inputSchema: {
      episode_id: z.string(),
      status: z.enum(["PLANNED", "IN_PROGRESS", "BLOCKED", "IN_REVIEW", "COMPLETED", "FAILED"]),
      blocked_reason: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      failure_reason: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      review_outcome: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      actor_id: z.string().optional()
    }
  },
  async ({ episode_id, status, blocked_reason, failure_reason, review_outcome, actor_id }) => {
    const episode = await prisma.episode.findUnique({
      where: { id: episode_id },
      include: { project: true }
    });

    if (!episode) {
      throw new Error("Episode not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.episode.update({
        where: { id: episode_id },
        data: {
          status,
          blockedReasonI18n: blocked_reason ? toI18n(blocked_reason) : episode.blockedReasonI18n,
          failureReasonI18n: failure_reason ? toI18n(failure_reason) : episode.failureReasonI18n,
          reviewOutcome: review_outcome ?? episode.reviewOutcome,
          endedAt: status === "COMPLETED" || status === "FAILED" ? new Date() : episode.endedAt
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: episode.project.workspaceId,
          projectId: episode.projectId,
          episodeId: episode.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: actor_id ?? episode.primaryAgentId,
          action: "update_episode_status",
          targetType: "episode",
          targetId: episode.id,
          result: "success",
          policyVersion: episode.policyVersion,
          permissionDecision: "allow"
        }
      });

      return record;
    });

    return toolResult({
      episode_id: updated.id,
      status: updated.status,
      review_outcome: updated.reviewOutcome
    });
  }
);

server.registerTool(
  "link_episode",
  {
    description: "Link two episodes with an explicit work relation.",
    inputSchema: {
      from_episode_id: z.string(),
      to_episode_id: z.string(),
      relation_type: z.enum(["DEPENDS_ON", "REVIEWS", "SUPERSEDES", "CONTINUES", "SPLITS_FROM", "REFERENCES"]),
      actor_id: z.string().optional()
    }
  },
  async ({ from_episode_id, to_episode_id, relation_type, actor_id }) => {
    const fromEpisode = await prisma.episode.findUnique({
      where: { id: from_episode_id },
      include: { project: true }
    });

    if (!fromEpisode) {
      throw new Error("Source episode not found");
    }

    const edge = await prisma.$transaction(async (tx) => {
      const created = await tx.nodeEdge.create({
        data: {
          fromNodeType: "episode",
          fromNodeId: from_episode_id,
          toNodeType: "episode",
          toNodeId: to_episode_id,
          edgeType: relation_type
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: fromEpisode.project.workspaceId,
          projectId: fromEpisode.projectId,
          episodeId: fromEpisode.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: actor_id ?? fromEpisode.primaryAgentId,
          action: "link_episode",
          targetType: "episode_edge",
          targetId: created.id,
          result: "success",
          policyVersion: fromEpisode.policyVersion,
          permissionDecision: "allow"
        }
      });

      return created;
    });

    return toolResult({
      edge_id: edge.id,
      relation_type: edge.edgeType,
      from_episode_id,
      to_episode_id
    });
  }
);

server.registerTool(
  "write_memory",
  {
    description: "Write a structured memory item into an episode.",
    inputSchema: {
      episode_id: z.string(),
      content: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]),
      memory_type: z.enum(["SEMANTIC", "EPISODIC", "PROCEDURAL"]),
      title: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      agent_id: z.string().optional(),
      importance: z.number().int().min(1).max(10).optional(),
      ttl_days: z.number().int().positive().optional(),
      source: z.string().optional(),
      sensitivity: z.string().optional()
    }
  },
  async ({ episode_id, content, memory_type, title, agent_id, importance, ttl_days, source, sensitivity }) => {
    const episode = await prisma.episode.findUnique({
      where: { id: episode_id },
      include: { project: true }
    });

    if (!episode) {
      throw new Error("Episode not found");
    }

    const memory = await prisma.$transaction(async (tx) => {
      const created = await tx.memoryItem.create({
        data: {
          episodeId: episode_id,
          agentId: agent_id ?? null,
          titleI18n: toI18n(title, { zh: "Memory item", en: "Memory item" }),
          contentI18n: toI18n(content),
          type: memory_type,
          source: source ?? "mcp",
          importance: importance ?? 5,
          sensitivity: sensitivity ?? "Internal",
          ttlDays: ttl_days ?? null
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: episode.project.workspaceId,
          projectId: episode.projectId,
          episodeId: episode.id,
          memoryItemId: created.id,
          occurredAt: new Date(),
          actorType: agent_id ? "agent" : "system",
          actorId: agent_id ?? episode.primaryAgentId,
          action: "write_memory",
          targetType: "memory",
          targetId: created.id,
          result: "success",
          policyVersion: episode.policyVersion,
          permissionDecision: "allow"
        }
      });

      return created;
    });

    return toolResult({
      memory_id: memory.id,
      episode_id: memory.episodeId,
      memory_type: memory.type
    });
  }
);

server.registerTool(
  "append_trace",
  {
    description: "Append a trace event as process evidence inside an episode.",
    inputSchema: {
      episode_id: z.string(),
      event_type: z.string(),
      summary: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]),
      actor_agent_id: z.string().optional(),
      tool_name: z.string().optional(),
      status: z.enum(["SUCCESS", "WARNING", "FAILED"]).optional(),
      step_title: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      input_excerpt: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      output_excerpt: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      error_message: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      related_memory_ids: z.array(z.string()).optional()
    }
  },
  async ({
    episode_id,
    event_type,
    summary,
    actor_agent_id,
    tool_name,
    status,
    step_title,
    input_excerpt,
    output_excerpt,
    error_message,
    related_memory_ids
  }) => {
    const episode = await prisma.episode.findUnique({
      where: { id: episode_id },
      include: { project: true, traceEvents: true }
    });

    if (!episode) {
      throw new Error("Episode not found");
    }

    const stepIndex = episode.traceEvents.length > 0 ? Math.max(...episode.traceEvents.map((item) => item.stepIndex)) + 1 : 1;

    const trace = await prisma.$transaction(async (tx) => {
      const created = await tx.traceEvent.create({
        data: {
          episodeId: episode_id,
          actorAgentId: actor_agent_id ?? null,
          stepIndex,
          eventType: event_type,
          toolName: tool_name ?? null,
          stepTitleI18n: toI18n(step_title, toI18n(summary)),
          status: status ?? "SUCCESS",
          shortResultI18n: toI18n(summary),
          inputSummaryI18n: input_excerpt ? toI18n(input_excerpt) : null,
          resultSummaryI18n: output_excerpt ? toI18n(output_excerpt) : null,
          errorSummaryI18n: error_message ? toI18n(error_message) : null,
          eventTime: new Date()
        }
      });

      if (Array.isArray(related_memory_ids) && related_memory_ids.length > 0) {
        await tx.nodeEdge.createMany({
          data: related_memory_ids.map((memoryId) => ({
            fromNodeType: "memory",
            fromNodeId: memoryId,
            toNodeType: "trace",
            toNodeId: created.id,
            edgeType: "USED_IN"
          }))
        });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: episode.project.workspaceId,
          projectId: episode.projectId,
          episodeId: episode.id,
          traceEventId: created.id,
          occurredAt: new Date(),
          actorType: actor_agent_id ? "agent" : "system",
          actorId: actor_agent_id ?? episode.primaryAgentId,
          action: "append_trace",
          targetType: "trace",
          targetId: created.id,
          result: created.status === "FAILED" ? "warning" : "success",
          policyVersion: episode.policyVersion,
          permissionDecision: "allow"
        }
      });

      return created;
    });

    return toolResult({
      trace_event_id: trace.id,
      episode_id: trace.episodeId,
      step_index: trace.stepIndex
    });
  }
);

server.registerTool(
  "create_artifact",
  {
    description: "Create or register an artifact generated from an episode.",
    inputSchema: {
      episode_id: z.string(),
      created_by_agent_id: z.string(),
      title: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]),
      artifact_type: z.enum(["MARKDOWN", "JSON", "CSV", "HTML", "SVG", "PDF", "SCRIPT", "IMAGE"]),
      content: z.union([z.string(), z.object({ zh: z.string(), en: z.string().optional() })]).optional(),
      uri: z.string().optional(),
      artifact_key: z.string().optional(),
      source_trace_id: z.string().optional(),
      source_memory_ids: z.array(z.string()).optional(),
      sensitivity: z.string().optional(),
      share_scope: z.string().optional()
    }
  },
  async ({
    episode_id,
    created_by_agent_id,
    title,
    artifact_type,
    content,
    uri,
    artifact_key,
    source_trace_id,
    source_memory_ids,
    sensitivity,
    share_scope
  }) => {
    const episode = await prisma.episode.findUnique({
      where: { id: episode_id },
      include: { project: true }
    });

    if (!episode) {
      throw new Error("Episode not found");
    }

    const key = artifact_key ?? `${episode_id}-${Date.now()}`;
    const latest = await prisma.artifact.findFirst({
      where: { artifactKey: key },
      orderBy: { version: "desc" }
    });

    const artifact = await prisma.$transaction(async (tx) => {
      const created = await tx.artifact.create({
        data: {
          episodeId: episode_id,
          createdByAgentId: created_by_agent_id,
          sourceTraceEventId: source_trace_id ?? null,
          artifactKey: key,
          titleI18n: toI18n(title),
          contentI18n: content ? toI18n(content) : null,
          fileType: artifact_type,
          version: latest ? latest.version + 1 : 1,
          uri: uri ?? null,
          sensitivity: sensitivity ?? "Internal",
          shareScope: share_scope ?? "project"
        }
      });

      const edgePayload = [];
      if (source_trace_id) {
        edgePayload.push({
          fromNodeType: "trace",
          fromNodeId: source_trace_id,
          toNodeType: "artifact",
          toNodeId: created.id,
          edgeType: "GENERATED_FROM"
        });
      }

      if (Array.isArray(source_memory_ids) && source_memory_ids.length > 0) {
        edgePayload.push(
          ...source_memory_ids.map((memoryId) => ({
            fromNodeType: "memory",
            fromNodeId: memoryId,
            toNodeType: "artifact",
            toNodeId: created.id,
            edgeType: "GENERATED_FROM"
          }))
        );
      }

      if (edgePayload.length > 0) {
        await tx.nodeEdge.createMany({ data: edgePayload });
      }

      await tx.auditEvent.create({
        data: {
          workspaceId: episode.project.workspaceId,
          projectId: episode.projectId,
          episodeId: episode.id,
          artifactId: created.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: created_by_agent_id,
          action: "create_artifact",
          targetType: "artifact",
          targetId: created.id,
          result: "success",
          policyVersion: episode.policyVersion,
          permissionDecision: "allow"
        }
      });

      return created;
    });

    return toolResult({
      artifact_id: artifact.id,
      artifact_key: artifact.artifactKey,
      version: artifact.version
    });
  }
);

server.registerTool(
  "query_context",
  {
    description: "Fetch project and episode context relevant to the current work goal.",
    inputSchema: {
      project_id: z.string(),
      goal: z.string(),
      episode_id: z.string().optional(),
      work_type: z.string().optional(),
      source_episode_ids: z.array(z.string()).optional(),
      limit: z.number().int().positive().optional(),
      include_memory: z.boolean().optional(),
      include_artifacts: z.boolean().optional(),
      include_related_episodes: z.boolean().optional(),
      locale: z.enum(["zh", "en"]).optional()
    }
  },
  async ({
    project_id,
    goal,
    work_type,
    source_episode_ids,
    limit,
    include_memory,
    include_artifacts,
    include_related_episodes,
    locale
  }) => {
    const max = typeof limit === "number" ? limit : 5;

    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: {
        episodes: {
          include: {
            memoryItems: include_memory === false ? false : { orderBy: { createdAt: "desc" }, take: max },
            artifacts: include_artifacts === false ? false : { orderBy: { updatedAt: "desc" }, take: max }
          },
          orderBy: { updatedAt: "desc" },
          take: max
        }
      }
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return toolResult({
      project_context: {
        project_id: project.id,
        name: localize(project.nameI18n, locale),
        description: localize(project.descriptionI18n, locale),
        active_policy_version: project.activePolicyVersion
      },
      relevant_memories:
        include_memory === false
          ? []
          : project.episodes.flatMap((episode) =>
              episode.memoryItems.map((memory) => ({
                id: memory.id,
                episode_id: episode.id,
                title: localize(memory.titleI18n, locale),
                content: localize(memory.contentI18n, locale),
                type: memory.type
              }))
            ),
      relevant_artifacts:
        include_artifacts === false
          ? []
          : project.episodes.flatMap((episode) =>
              episode.artifacts.map((artifact) => ({
                id: artifact.id,
                episode_id: episode.id,
                title: localize(artifact.titleI18n, locale),
                type: artifact.fileType,
                version: artifact.version,
                uri: artifact.uri
              }))
            ),
      related_episodes:
        include_related_episodes === false
          ? []
          : project.episodes.map((episode) => ({
              id: episode.id,
              title: localize(episode.titleI18n, locale),
              goal: localize(episode.goalI18n, locale),
              status: episode.status,
              work_type: episode.workType,
              primary_actor: episode.primaryActor
            })),
      notes: {
        goal,
        work_type: work_type ?? null,
        source_episode_ids: source_episode_ids ?? []
      }
    });
  }
);

server.registerTool(
  "get_episode_brief",
  {
    description: "Return a manager-readable brief for a single episode.",
    inputSchema: {
      episode_id: z.string(),
      locale: z.enum(["zh", "en"]).optional(),
      include_relations: z.boolean().optional(),
      include_artifacts: z.boolean().optional(),
      include_recent_trace: z.boolean().optional()
    }
  },
  async ({ episode_id, locale, include_relations, include_artifacts, include_recent_trace }) => {
    const episode = await prisma.episode.findUnique({
      where: { id: episode_id },
      include: {
        project: true,
        memoryItems: { orderBy: { createdAt: "desc" }, take: 3 },
        traceEvents: { orderBy: { stepIndex: "desc" }, take: 5 },
        artifacts: { orderBy: { updatedAt: "desc" }, take: 3 },
        auditEvents: { orderBy: { occurredAt: "desc" } }
      }
    });

    if (!episode) {
      throw new Error("Episode not found");
    }

    const relations = include_relations === false
      ? []
      : await prisma.nodeEdge.findMany({
          where: {
            OR: [
              { fromNodeType: "episode", fromNodeId: episode_id },
              { toNodeType: "episode", toNodeId: episode_id }
            ]
          },
          orderBy: { createdAt: "desc" },
          take: 10
        });

    return toolResult({
      episode_id: episode.id,
      title: localize(episode.titleI18n, locale),
      goal: localize(episode.goalI18n, locale),
      status: episode.status,
      work_type: episode.workType,
      primary_actor: episode.primaryActor ?? "Unknown",
      success_criteria: localize(episode.successCriteriaI18n, locale),
      project: {
        project_id: episode.projectId,
        name: localize(episode.project.nameI18n, locale)
      },
      key_relations: relations.map((edge) => ({
        edge_type: edge.edgeType,
        from_node_id: edge.fromNodeId,
        to_node_id: edge.toNodeId
      })),
      key_memories: episode.memoryItems.map((memory) => ({
        id: memory.id,
        title: localize(memory.titleI18n, locale),
        type: memory.type
      })),
      latest_artifacts:
        include_artifacts === false
          ? []
          : episode.artifacts.map((artifact) => ({
              id: artifact.id,
              title: localize(artifact.titleI18n, locale),
              type: artifact.fileType,
              version: artifact.version
            })),
      attention_items: [
        ...episode.auditEvents.filter((event) => event.permissionDecision === "deny").map((event) => ({
          type: "permission_denied",
          detail: event.action
        })),
        ...episode.auditEvents.filter((event) => event.policyHitReasonI18n).map((event) => ({
          type: "policy_hit",
          detail: localize(event.policyHitReasonI18n, locale)
        })),
        ...(include_recent_trace === false
          ? []
          : episode.traceEvents.map((trace) => ({
              type: "recent_trace",
              detail: localize(trace.stepTitleI18n, locale)
            })))
      ]
    });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(async (error) => {
  console.error("MCP server error:", error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
