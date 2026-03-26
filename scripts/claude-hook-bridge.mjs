import fs from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import "./_lib/load-env.mjs";

const prisma = new PrismaClient();

const hookSchema = z.object({
  session_id: z.string(),
  transcript_path: z.string().optional(),
  cwd: z.string().optional(),
  hook_event_name: z.string(),
  tool_name: z.string().optional(),
  tool_input: z.any().optional(),
  tool_response: z.any().optional(),
  message: z.string().optional(),
  prompt: z.string().optional(),
  stop_hook_active: z.boolean().optional()
});

const mapDir = path.resolve(process.cwd(), ".agent-work-graph");
const mapPath = path.join(mapDir, "claude-session-map.json");

function toI18n(value) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  return { zh: text, en: text };
}

function clip(text, max = 120) {
  if (!text) return "";
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function jsonSummary(value, max = 400) {
  if (value == null) return null;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return clip(text, max);
}

function derivePrimaryActor(agentSlug) {
  return agentSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ensureMapFile() {
  fs.mkdirSync(mapDir, { recursive: true });
  if (!fs.existsSync(mapPath)) {
    fs.writeFileSync(mapPath, "{}\n", "utf8");
  }
}

function loadSessionMap() {
  ensureMapFile();
  return JSON.parse(fs.readFileSync(mapPath, "utf8"));
}

function saveSessionMap(map) {
  ensureMapFile();
  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`, "utf8");
}

async function resolveProjectBySlug(slug) {
  return prisma.project.findUnique({
    where: { slug },
    include: { workspace: true }
  });
}

async function resolveAgentBySlug(slug) {
  return prisma.agent.findUnique({ where: { slug } });
}

async function appendTraceWithAudit({
  episode,
  actorAgentId,
  eventType,
  toolName,
  title,
  status = "SUCCESS",
  shortResult,
  inputSummary,
  resultSummary,
  errorSummary
}) {
  const existing = await prisma.traceEvent.findMany({
    where: { episodeId: episode.id },
    orderBy: { stepIndex: "desc" },
    take: 1
  });
  const stepIndex = existing.length > 0 ? existing[0].stepIndex + 1 : 1;

  return prisma.$transaction(async (tx) => {
    const trace = await tx.traceEvent.create({
      data: {
        episodeId: episode.id,
        actorAgentId: actorAgentId ?? episode.primaryAgentId,
        stepIndex,
        eventType,
        toolName: toolName ?? null,
        stepTitleI18n: toI18n(title) ?? toI18n(eventType),
        status,
        shortResultI18n: toI18n(shortResult) ?? toI18n(title) ?? toI18n(eventType),
        inputSummaryI18n: toI18n(inputSummary),
        resultSummaryI18n: toI18n(resultSummary),
        errorSummaryI18n: toI18n(errorSummary),
        eventTime: new Date()
      }
    });

    await tx.auditEvent.create({
      data: {
        workspaceId: episode.project.workspaceId,
        projectId: episode.projectId,
        episodeId: episode.id,
        traceEventId: trace.id,
        occurredAt: new Date(),
        actorType: "agent",
        actorId: actorAgentId ?? episode.primaryAgentId,
        action: "claude_hook_event",
        targetType: "trace",
        targetId: trace.id,
        result: status === "FAILED" ? "warning" : "success",
        policyVersion: episode.policyVersion,
        permissionDecision: "allow"
      }
    });

    return trace;
  });
}

async function createEpisodeForSession(prompt, sessionId) {
  const projectSlug = process.env.AWG_PROJECT_SLUG;
  const primaryAgentSlug = process.env.AWG_PRIMARY_AGENT_SLUG;
  const workType = process.env.AWG_WORK_TYPE || "GENERATE";

  if (!projectSlug || !primaryAgentSlug) {
    return null;
  }

  const [project, primaryAgent] = await Promise.all([
    resolveProjectBySlug(projectSlug),
    resolveAgentBySlug(primaryAgentSlug)
  ]);

  if (!project || !primaryAgent) {
    throw new Error("Claude hook bridge could not resolve project or primary agent from slugs.");
  }

  const title = clip(prompt || "Claude session import", 80);

  const created = await prisma.$transaction(async (tx) => {
    const episode = await tx.episode.create({
      data: {
        projectId: project.id,
        primaryAgentId: primaryAgent.id,
        titleI18n: toI18n(title),
        summaryI18n: toI18n("Created automatically from Claude Code hook bridge."),
        goalI18n: toI18n(prompt || title),
        successCriteriaI18n: toI18n("Capture Claude Code session as a replayable episode."),
        primaryActor: derivePrimaryActor(primaryAgentSlug),
        workType,
        status: "IN_PROGRESS",
        policyVersion: project.activePolicyVersion,
        startedAt: new Date()
      }
    });

    await tx.episodeAgent.upsert({
      where: {
        episodeId_agentId: {
          episodeId: episode.id,
          agentId: primaryAgent.id
        }
      },
      update: {},
      create: {
        episodeId: episode.id,
        agentId: primaryAgent.id
      }
    });

    if (prompt) {
      const memory = await tx.memoryItem.create({
        data: {
          episodeId: episode.id,
          agentId: primaryAgent.id,
          titleI18n: toI18n("Claude initial prompt"),
          contentI18n: toI18n(prompt),
          type: "SEMANTIC",
          source: "claude_hook",
          importance: 8,
          sensitivity: "Internal"
        }
      });

      await tx.auditEvent.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          episodeId: episode.id,
          memoryItemId: memory.id,
          occurredAt: new Date(),
          actorType: "agent",
          actorId: primaryAgent.id,
          action: "claude_prompt_memory",
          targetType: "memory_item",
          targetId: memory.id,
          result: "success",
          policyVersion: project.activePolicyVersion,
          permissionDecision: "allow"
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
        action: "create_episode_from_claude_hook",
        targetType: "episode",
        targetId: episode.id,
        result: "success",
        policyVersion: project.activePolicyVersion,
        permissionDecision: "allow"
      }
    });

    return episode;
  });

  const map = loadSessionMap();
  map[sessionId] = created.id;
  saveSessionMap(map);

  return created.id;
}

async function resolveEpisodeForSession(sessionId) {
  if (process.env.AWG_EPISODE_ID) {
    return prisma.episode.findFirst({
      where: { id: process.env.AWG_EPISODE_ID },
      include: { project: true }
    });
  }

  const map = loadSessionMap();
  const episodeId = map[sessionId];
  if (!episodeId) return null;

  try {
    const episode = await prisma.episode.findFirst({
      where: { id: episodeId },
      include: { project: true }
    });

    if (!episode || !episode.project) {
      delete map[sessionId];
      saveSessionMap(map);
      return null;
    }

    return episode;
  } catch {
    delete map[sessionId];
    saveSessionMap(map);
    return null;
  }
}

async function ensureEpisodeForPrompt(payload) {
  let episode = await resolveEpisodeForSession(payload.session_id);
  if (episode) return episode;

  const episodeId = await createEpisodeForSession(payload.prompt, payload.session_id);
  if (!episodeId) return null;

  return prisma.episode.findUnique({
    where: { id: episodeId },
    include: { project: true }
  });
}

async function maybeMarkInReview(episode) {
  if (process.env.AWG_AUTO_REVIEW_ON_STOP !== "true") {
    return;
  }

  await prisma.episode.update({
    where: { id: episode.id },
    data: {
      status: "IN_REVIEW",
      reviewOutcome: "PENDING"
    }
  });
}

async function main() {
  const raw = await new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });

  if (!raw.trim()) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const payload = hookSchema.parse(JSON.parse(raw));

  if (payload.hook_event_name === "UserPromptSubmit") {
    const episode = await ensureEpisodeForPrompt(payload);
    if (episode) {
      await appendTraceWithAudit({
        episode,
        actorAgentId: episode.primaryAgentId,
        eventType: "CLAUDE_USER_PROMPT",
        title: "Claude user prompt submitted",
        status: "SUCCESS",
        shortResult: clip(payload.prompt || "User prompt submitted", 120),
        inputSummary: payload.prompt || null
      });
    }

    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const episode = await resolveEpisodeForSession(payload.session_id);
  if (!episode) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  if (payload.hook_event_name === "PreToolUse") {
    await appendTraceWithAudit({
      episode,
      actorAgentId: episode.primaryAgentId,
      eventType: "CLAUDE_PRE_TOOL_USE",
      toolName: payload.tool_name,
      title: payload.tool_name ? `Claude about to use ${payload.tool_name}` : "Claude pre-tool event",
      status: "WARNING",
      shortResult: clip(`Preparing ${payload.tool_name || "tool"} call`, 120),
      inputSummary: jsonSummary(payload.tool_input)
    });
  } else if (payload.hook_event_name === "PostToolUse") {
    const toolResponse = payload.tool_response;
    const status =
      toolResponse && typeof toolResponse === "object" && "success" in toolResponse && toolResponse.success === false
        ? "FAILED"
        : "SUCCESS";

    await appendTraceWithAudit({
      episode,
      actorAgentId: episode.primaryAgentId,
      eventType: "CLAUDE_POST_TOOL_USE",
      toolName: payload.tool_name,
      title: payload.tool_name ? `Claude finished ${payload.tool_name}` : "Claude post-tool event",
      status,
      shortResult: clip(jsonSummary(toolResponse) || `${payload.tool_name || "Tool"} completed`, 120),
      inputSummary: jsonSummary(payload.tool_input),
      resultSummary: jsonSummary(toolResponse),
      errorSummary: status === "FAILED" ? jsonSummary(toolResponse) : null
    });
  } else if (payload.hook_event_name === "Notification") {
    await appendTraceWithAudit({
      episode,
      actorAgentId: episode.primaryAgentId,
      eventType: "CLAUDE_NOTIFICATION",
      title: "Claude notification",
      status: "WARNING",
      shortResult: clip(payload.message || "Claude notification", 120),
      resultSummary: payload.message || null
    });
  } else if (
    payload.hook_event_name === "Stop" ||
    payload.hook_event_name === "SubagentStop" ||
    payload.hook_event_name === "SessionEnd"
  ) {
    await appendTraceWithAudit({
      episode,
      actorAgentId: episode.primaryAgentId,
      eventType: `CLAUDE_${payload.hook_event_name.toUpperCase()}`,
      title: `Claude ${payload.hook_event_name}`,
      status: "SUCCESS",
      shortResult: `${payload.hook_event_name} received`
    });
    await maybeMarkInReview(episode);
  } else if (payload.hook_event_name === "SessionStart") {
    await appendTraceWithAudit({
      episode,
      actorAgentId: episode.primaryAgentId,
      eventType: "CLAUDE_SESSION_START",
      title: "Claude session started",
      status: "SUCCESS",
      shortResult: "Session start event received"
    });
  }

  console.log(JSON.stringify({ continue: true }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
