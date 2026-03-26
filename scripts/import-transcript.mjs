import fs from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import "./_lib/load-env.mjs";

const prisma = new PrismaClient();

const localizedTextSchema = z.union([
  z.string(),
  z.object({
    zh: z.string().optional(),
    en: z.string().optional()
  })
]);

const memorySchema = z.object({
  title: localizedTextSchema,
  content: localizedTextSchema,
  type: z.enum(["SEMANTIC", "EPISODIC", "PROCEDURAL"]).default("EPISODIC"),
  source: z.string().default("host_import"),
  importance: z.number().int().min(1).max(10).default(5),
  sensitivity: z.string().default("Internal"),
  ttl_days: z.number().int().positive().optional(),
  agent_slug: z.string().optional()
});

const traceSchema = z.object({
  step_index: z.number().int().positive(),
  event_type: z.string(),
  title: localizedTextSchema,
  status: z.enum(["SUCCESS", "WARNING", "FAILED"]).default("SUCCESS"),
  short_result: localizedTextSchema,
  input_summary: localizedTextSchema.optional(),
  decision_summary: localizedTextSchema.optional(),
  result_summary: localizedTextSchema.optional(),
  error_summary: localizedTextSchema.optional(),
  policy_hit_reason: localizedTextSchema.optional(),
  permission_denied: localizedTextSchema.optional(),
  tool_name: z.string().optional(),
  event_time: z.string().datetime().optional(),
  actor_agent_slug: z.string().optional()
});

const artifactSchema = z.object({
  artifact_key: z.string(),
  title: localizedTextSchema,
  content: localizedTextSchema.optional(),
  file_type: z.enum(["MARKDOWN", "JSON", "CSV", "HTML", "SVG", "PDF", "SCRIPT", "IMAGE"]),
  version: z.number().int().positive().default(1),
  uri: z.string().optional(),
  sensitivity: z.string().default("Internal"),
  share_scope: z.string().default("project"),
  created_by_agent_slug: z.string().optional(),
  source_trace_index: z.number().int().positive().optional()
});

const relationSchema = z.object({
  target_episode_id: z.string(),
  relation_type: z.enum([
    "DEPENDS_ON",
    "REVIEWS",
    "SUPERSEDES",
    "CONTINUES",
    "SPLITS_FROM",
    "REFERENCES"
  ])
});

const importSchema = z.object({
  workspace_slug: z.string().optional(),
  project_slug: z.string(),
  primary_agent_slug: z.string(),
  title: localizedTextSchema,
  summary: localizedTextSchema.optional(),
  goal: localizedTextSchema.optional(),
  success_criteria: localizedTextSchema.optional(),
  final_outcome: localizedTextSchema.optional(),
  primary_actor: z.string().optional(),
  work_type: z.enum(["RESEARCH", "GENERATE", "REVIEW", "REVISE", "APPROVE", "SUMMARIZE"]).default("GENERATE"),
  status: z.enum(["PLANNED", "IN_PROGRESS", "BLOCKED", "IN_REVIEW", "COMPLETED", "FAILED"]).default("PLANNED"),
  review_outcome: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  policy_version: z.string().default("policy.import.v1"),
  relation_intent: z
    .enum(["DEPENDS_ON", "REVIEWS", "SUPERSEDES", "CONTINUES", "SPLITS_FROM", "REFERENCES"])
    .optional(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  episode_agent_slugs: z.array(z.string()).default([]),
  memories: z.array(memorySchema).default([]),
  traces: z.array(traceSchema).default([]),
  artifacts: z.array(artifactSchema).default([]),
  links: z.array(relationSchema).default([])
});

function toI18n(value) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return { zh: value, en: value };
  }

  return {
    zh: value.zh ?? value.en ?? "",
    en: value.en ?? value.zh ?? ""
  };
}

async function resolveProject(projectSlug) {
  return prisma.project.findUnique({
    where: { slug: projectSlug },
    include: { workspace: true }
  });
}

async function resolveAgent(slug) {
  return prisma.agent.findUnique({ where: { slug } });
}

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log("Usage: node scripts/import-transcript.mjs <path-to-json>");
    process.exit(0);
  }

  const raw = fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");
  const payload = importSchema.parse(JSON.parse(raw));

  const project = await resolveProject(payload.project_slug);
  if (!project) {
    throw new Error(`Project not found for slug: ${payload.project_slug}`);
  }

  const primaryAgent = await resolveAgent(payload.primary_agent_slug);
  if (!primaryAgent) {
    throw new Error(`Primary agent not found for slug: ${payload.primary_agent_slug}`);
  }

  const referencedAgentSlugs = new Set([
    payload.primary_agent_slug,
    ...payload.episode_agent_slugs,
    ...payload.memories.map((item) => item.agent_slug).filter(Boolean),
    ...payload.traces.map((item) => item.actor_agent_slug).filter(Boolean),
    ...payload.artifacts.map((item) => item.created_by_agent_slug).filter(Boolean)
  ]);

  const agentMap = new Map();
  for (const slug of referencedAgentSlugs) {
    const agent = await resolveAgent(slug);
    if (agent) {
      agentMap.set(slug, agent);
    }
  }

  if (!agentMap.has(payload.primary_agent_slug)) {
    throw new Error(`Resolved agent map missing primary agent: ${payload.primary_agent_slug}`);
  }

  const startedAt = payload.started_at ? new Date(payload.started_at) : new Date();
  const endedAt = payload.ended_at ? new Date(payload.ended_at) : null;

  const result = await prisma.$transaction(async (tx) => {
    const episode = await tx.episode.create({
      data: {
        projectId: project.id,
        primaryAgentId: primaryAgent.id,
        titleI18n: toI18n(payload.title),
        summaryI18n: toI18n(payload.summary),
        goalI18n: toI18n(payload.goal),
        successCriteriaI18n: toI18n(payload.success_criteria),
        finalOutcomeI18n: toI18n(payload.final_outcome),
        primaryActor: payload.primary_actor ?? primaryAgent.name,
        workType: payload.work_type,
        relationIntent: payload.relation_intent ?? null,
        status: payload.status,
        reviewOutcome: payload.review_outcome ?? null,
        policyVersion: payload.policy_version,
        startedAt,
        endedAt
      }
    });

    const participatingAgents = [...new Set([payload.primary_agent_slug, ...payload.episode_agent_slugs])]
      .map((slug) => agentMap.get(slug))
      .filter(Boolean);

    for (const agent of participatingAgents) {
      await tx.episodeAgent.upsert({
        where: {
          episodeId_agentId: {
            episodeId: episode.id,
            agentId: agent.id
          }
        },
        update: {},
        create: {
          episodeId: episode.id,
          agentId: agent.id
        }
      });
    }

    const createdMemories = [];
    for (const item of payload.memories) {
      const agent = item.agent_slug ? agentMap.get(item.agent_slug) : undefined;
      const memory = await tx.memoryItem.create({
        data: {
          episodeId: episode.id,
          agentId: agent?.id ?? null,
          titleI18n: toI18n(item.title),
          contentI18n: toI18n(item.content),
          type: item.type,
          source: item.source,
          importance: item.importance,
          sensitivity: item.sensitivity,
          ttlDays: item.ttl_days ?? null
        }
      });
      createdMemories.push(memory);

      await tx.auditEvent.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          episodeId: episode.id,
          memoryItemId: memory.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: agent?.id ?? primaryAgent.id,
          action: "import_memory",
          targetType: "memory_item",
          targetId: memory.id,
          result: "success",
          policyVersion: payload.policy_version
        }
      });
    }

    const traceMap = new Map();
    for (const item of payload.traces) {
      const actorAgent = item.actor_agent_slug ? agentMap.get(item.actor_agent_slug) : undefined;
      const trace = await tx.traceEvent.create({
        data: {
          episodeId: episode.id,
          actorAgentId: actorAgent?.id ?? primaryAgent.id,
          stepIndex: item.step_index,
          eventType: item.event_type,
          toolName: item.tool_name ?? null,
          stepTitleI18n: toI18n(item.title),
          status: item.status,
          shortResultI18n: toI18n(item.short_result),
          inputSummaryI18n: toI18n(item.input_summary),
          decisionSummaryI18n: toI18n(item.decision_summary),
          resultSummaryI18n: toI18n(item.result_summary),
          errorSummaryI18n: toI18n(item.error_summary),
          policyHitReasonI18n: toI18n(item.policy_hit_reason),
          permissionDeniedI18n: toI18n(item.permission_denied),
          eventTime: item.event_time ? new Date(item.event_time) : new Date()
        }
      });

      traceMap.set(item.step_index, trace);

      await tx.auditEvent.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          episodeId: episode.id,
          traceEventId: trace.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: actorAgent?.id ?? primaryAgent.id,
          action: "import_trace",
          targetType: "trace_event",
          targetId: trace.id,
          result: "success",
          policyVersion: payload.policy_version
        }
      });
    }

    const createdArtifacts = [];
    for (const item of payload.artifacts) {
      const agent = item.created_by_agent_slug ? agentMap.get(item.created_by_agent_slug) : primaryAgent;
      const sourceTrace = item.source_trace_index ? traceMap.get(item.source_trace_index) : undefined;
      const artifact = await tx.artifact.create({
        data: {
          episodeId: episode.id,
          createdByAgentId: agent.id,
          sourceTraceEventId: sourceTrace?.id ?? null,
          artifactKey: item.artifact_key,
          titleI18n: toI18n(item.title),
          contentI18n: toI18n(item.content),
          fileType: item.file_type,
          version: item.version,
          uri: item.uri ?? null,
          sensitivity: item.sensitivity,
          shareScope: item.share_scope
        }
      });
      createdArtifacts.push(artifact);

      await tx.auditEvent.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          episodeId: episode.id,
          artifactId: artifact.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: agent.id,
          action: "import_artifact",
          targetType: "artifact",
          targetId: artifact.id,
          result: "success",
          policyVersion: payload.policy_version
        }
      });
    }

    for (const link of payload.links) {
      await tx.nodeEdge.create({
        data: {
          fromNodeType: "episode",
          fromNodeId: episode.id,
          toNodeType: "episode",
          toNodeId: link.target_episode_id,
          edgeType: link.relation_type
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
        actorId: primaryAgent.id,
        action: "import_episode",
        targetType: "episode",
        targetId: episode.id,
        result: "success",
        policyVersion: payload.policy_version
      }
    });

    return {
      episodeId: episode.id,
      memoryCount: createdMemories.length,
      traceCount: traceMap.size,
      artifactCount: createdArtifacts.length,
      relationCount: payload.links.length
    };
  });

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
