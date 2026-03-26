import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().optional(),
  time: z.any().optional()
});

const reasoningPartSchema = z.object({
  type: z.literal("reasoning"),
  text: z.string().optional(),
  time: z.any().optional()
});

const toolPartSchema = z.object({
  type: z.literal("tool"),
  tool: z.string().optional(),
  state: z
    .object({
      status: z.string(),
      title: z.string().optional(),
      input: z.any().optional(),
      output: z.string().optional(),
      error: z.string().optional()
    })
    .optional(),
  time: z.any().optional()
});

const patchPartSchema = z.object({
  type: z.literal("patch"),
  files: z.array(z.string()).optional()
});

const filePartSchema = z.object({
  type: z.literal("file"),
  filename: z.string().optional(),
  mime: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional()
});

const fallbackPartSchema = z.object({
  type: z.string()
});

const partSchema = z.union([
  textPartSchema,
  reasoningPartSchema,
  toolPartSchema,
  patchPartSchema,
  filePartSchema,
  fallbackPartSchema
]);

const exportMessageSchema = z.object({
  info: z.object({
    id: z.string().optional(),
    role: z.string(),
    time: z
      .object({
        created: z.number().optional(),
        completed: z.number().optional()
      })
      .optional()
  }),
  parts: z.array(partSchema).default([])
});

const opencodeExportSchema = z.object({
  info: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional()
  }),
  messages: z.array(exportMessageSchema).default([])
});

function toI18n(text) {
  return {
    zh: text,
    en: text
  };
}

function inferFileType(filePath = "") {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".md":
      return "MARKDOWN";
    case ".json":
      return "JSON";
    case ".csv":
      return "CSV";
    case ".html":
      return "HTML";
    case ".svg":
      return "SVG";
    case ".pdf":
      return "PDF";
    case ".js":
    case ".ts":
    case ".tsx":
    case ".jsx":
    case ".py":
    case ".sh":
      return "SCRIPT";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".webp":
      return "IMAGE";
    default:
      return "MARKDOWN";
  }
}

function clip(text, limit = 280) {
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function getMessageTimestamp(message) {
  const created = message.info.time?.created;
  return typeof created === "number" ? new Date(created).toISOString() : undefined;
}

function collectText(parts, types) {
  return parts
    .filter((part) => types.includes(part.type) && "text" in part && part.text)
    .map((part) => part.text)
    .join("\n\n")
    .trim();
}

function derivePrimaryActor(slug) {
  return slug
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function normalizeStatus(exportSession) {
  const toolErrors = exportSession.messages.some((message) =>
    message.parts.some(
      (part) =>
        part.type === "tool" &&
        part.state &&
        (part.state.status === "error" || Boolean(part.state.error))
    )
  );

  if (toolErrors) {
    return "FAILED";
  }

  const hasAssistantOutput = exportSession.messages.some(
    (message) => message.info.role === "assistant" && collectText(message.parts, ["text"]).length > 0
  );

  return hasAssistantOutput ? "COMPLETED" : "IN_PROGRESS";
}

function buildNormalizedPackage(exportSession, projectSlug, primaryAgentSlug) {
  const firstUserMessage = exportSession.messages.find((message) => message.info.role === "user");
  const firstUserText = firstUserMessage ? collectText(firstUserMessage.parts, ["text"]) : "";
  const title = exportSession.info.title || clip(firstUserText, 80) || "Imported OpenCode Session";
  const summary = `Imported from OpenCode session ${exportSession.info.id ?? "unknown-session"}.`;
  const status = normalizeStatus(exportSession);
  const workType = "GENERATE";
  const primaryActor = derivePrimaryActor(primaryAgentSlug);

  const memories = exportSession.messages
    .filter((message) => message.info.role === "user")
    .map((message, index) => {
      const text = collectText(message.parts, ["text"]);
      if (!text) return null;

      return {
        title: toI18n(index === 0 ? "OpenCode initial prompt" : `OpenCode user prompt ${index + 1}`),
        content: toI18n(text),
        type: index === 0 ? "SEMANTIC" : "EPISODIC",
        source: "opencode_export",
        importance: index === 0 ? 8 : 5,
        sensitivity: "Internal",
        agent_slug: primaryAgentSlug
      };
    })
    .filter(Boolean);

  const traces = [];
  const artifacts = [];
  let stepIndex = 1;
  let artifactVersion = 1;

  for (const message of exportSession.messages) {
    const eventTime = getMessageTimestamp(message);

    if (message.info.role === "assistant") {
      const assistantText = collectText(message.parts, ["text", "reasoning"]);
      if (assistantText) {
        traces.push({
          step_index: stepIndex++,
          event_type: "ASSISTANT_RESPONSE",
          title: toI18n("OpenCode assistant response"),
          status: "SUCCESS",
          short_result: toI18n(clip(assistantText, 120)),
          result_summary: toI18n(assistantText),
          event_time: eventTime,
          actor_agent_slug: primaryAgentSlug
        });
      }
    }

    for (const part of message.parts) {
      if (part.type === "tool") {
        const toolStatus =
          part.state?.status === "error"
            ? "FAILED"
            : part.state?.status === "completed"
              ? "SUCCESS"
              : "WARNING";

        traces.push({
          step_index: stepIndex++,
          event_type: "TOOL_EXECUTION",
          title: toI18n(part.state?.title || part.tool || "OpenCode tool execution"),
          status: toolStatus,
          short_result: toI18n(
            clip(part.state?.output || part.state?.error || part.state?.title || part.tool || "Tool event", 120)
          ),
          input_summary: part.state?.input ? toI18n(JSON.stringify(part.state.input)) : undefined,
          result_summary: part.state?.output ? toI18n(part.state.output) : undefined,
          error_summary: part.state?.error ? toI18n(part.state.error) : undefined,
          tool_name: part.tool,
          event_time: eventTime,
          actor_agent_slug: primaryAgentSlug
        });
      }

      if (part.type === "patch" && Array.isArray(part.files)) {
        for (const filePath of part.files) {
          artifacts.push({
            artifact_key: `opencode-${exportSession.info.id || "session"}-${filePath.replaceAll("/", "-")}`,
            title: toI18n(path.basename(filePath)),
            file_type: inferFileType(filePath),
            version: artifactVersion++,
            uri: filePath,
            sensitivity: "Internal",
            share_scope: "project",
            created_by_agent_slug: primaryAgentSlug
          });
        }
      }

      if (part.type === "file" && part.filename) {
        artifacts.push({
          artifact_key: `opencode-file-${exportSession.info.id || "session"}-${part.filename.replaceAll("/", "-")}`,
          title: toI18n(path.basename(part.filename)),
          content: part.text ? toI18n(part.text) : undefined,
          file_type: inferFileType(part.filename),
          version: artifactVersion++,
          uri: part.url || part.filename,
          sensitivity: "Internal",
          share_scope: "project",
          created_by_agent_slug: primaryAgentSlug
        });
      }
    }
  }

  const startedAt =
    typeof exportSession.info.createdAt === "number"
      ? new Date(exportSession.info.createdAt).toISOString()
      : undefined;
  const endedAt =
    typeof exportSession.info.updatedAt === "number"
      ? new Date(exportSession.info.updatedAt).toISOString()
      : undefined;

  return {
    project_slug: projectSlug,
    primary_agent_slug: primaryAgentSlug,
    title: toI18n(title),
    summary: toI18n(summary),
    goal: firstUserText ? toI18n(firstUserText) : undefined,
    success_criteria: toI18n("Imported OpenCode session is converted into a replayable episode."),
    final_outcome: status === "COMPLETED" ? toI18n("OpenCode session import completed.") : undefined,
    primary_actor: primaryActor,
    work_type: workType,
    status,
    review_outcome: status === "COMPLETED" ? "APPROVED" : undefined,
    policy_version: "policy.import.opencode.v1",
    started_at: startedAt,
    ended_at: endedAt,
    episode_agent_slugs: [primaryAgentSlug],
    memories,
    traces,
    artifacts,
    links: []
  };
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/normalize-opencode-export.mjs <input.json> <project-slug> <primary-agent-slug> [output.json]",
      "",
      "Examples:",
      "  node scripts/normalize-opencode-export.mjs raw/session.json q2-customer-pulse research-agent",
      "  node scripts/normalize-opencode-export.mjs raw/session.json q2-customer-pulse research-agent normalized.json"
    ].join("\n")
  );
}

function main() {
  const [inputPath, projectSlug, primaryAgentSlug, outputPath] = process.argv.slice(2);

  if (!inputPath || !projectSlug || !primaryAgentSlug) {
    printUsage();
    process.exit(inputPath ? 1 : 0);
  }

  const raw = fs.readFileSync(path.resolve(process.cwd(), inputPath), "utf8");
  const exportSession = opencodeExportSchema.parse(JSON.parse(raw));
  const normalized = buildNormalizedPackage(exportSession, projectSlug, primaryAgentSlug);
  const payload = `${JSON.stringify(normalized, null, 2)}\n`;

  if (!outputPath) {
    console.log(payload);
    return;
  }

  const resolvedOutput = path.resolve(process.cwd(), outputPath);
  fs.mkdirSync(path.dirname(resolvedOutput), { recursive: true });
  fs.writeFileSync(resolvedOutput, payload, "utf8");
  console.log(`Wrote normalized OpenCode transcript to ${resolvedOutput}`);
}

main();
