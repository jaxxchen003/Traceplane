import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function runHook(payload, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/claude-hook-bridge.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...env
      },
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Hook bridge exited with code ${code}`));
        return;
      }

      resolve({ stdout, stderr });
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });
}

async function main() {
  const sessionId = "claude-hook-test-session";
  const mapDir = path.resolve(process.cwd(), ".agent-work-graph");
  const mapPath = path.join(mapDir, "claude-session-map.json");

  if (fs.existsSync(mapPath)) {
    const current = JSON.parse(fs.readFileSync(mapPath, "utf8"));
    delete current[sessionId];
    fs.mkdirSync(mapDir, { recursive: true });
    fs.writeFileSync(mapPath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
  }

  const env = {
    AWG_PROJECT_SLUG: "q2-customer-pulse",
    AWG_PRIMARY_AGENT_SLUG: "research-agent",
    AWG_AUTO_REVIEW_ON_STOP: "true"
  };

  await runHook(
    {
      session_id: sessionId,
      transcript_path: "/tmp/claude-hook-test.jsonl",
      cwd: process.cwd(),
      hook_event_name: "UserPromptSubmit",
      prompt: "Review this week's customer feedback and prepare a short management note."
    },
    env
  );

  await runHook(
    {
      session_id: sessionId,
      transcript_path: "/tmp/claude-hook-test.jsonl",
      cwd: process.cwd(),
      hook_event_name: "PreToolUse",
      tool_name: "Read",
      tool_input: {
        file_path: "data/customer-feedback-weekly.md"
      }
    },
    env
  );

  await runHook(
    {
      session_id: sessionId,
      transcript_path: "/tmp/claude-hook-test.jsonl",
      cwd: process.cwd(),
      hook_event_name: "PostToolUse",
      tool_name: "Read",
      tool_input: {
        file_path: "data/customer-feedback-weekly.md"
      },
      tool_response: {
        filePath: "data/customer-feedback-weekly.md",
        success: true
      }
    },
    env
  );

  await runHook(
    {
      session_id: sessionId,
      transcript_path: "/tmp/claude-hook-test.jsonl",
      cwd: process.cwd(),
      hook_event_name: "Stop",
      stop_hook_active: false
    },
    env
  );

  const candidates = await prisma.episode.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      traceEvents: { orderBy: { stepIndex: "asc" } }
    }
  });

  const episode = candidates.find(
    (item) =>
      item.summaryI18n &&
      typeof item.summaryI18n === "object" &&
      (item.summaryI18n.zh === "Created automatically from Claude Code hook bridge." ||
        item.summaryI18n.en === "Created automatically from Claude Code hook bridge.")
  );

  if (!episode) {
    throw new Error("Claude hook bridge did not create an episode.");
  }

  console.log(
    JSON.stringify(
      {
        episodeId: episode.id,
        status: episode.status,
        reviewOutcome: episode.reviewOutcome,
        traceCount: episode.traceEvents.length,
        traceEvents: episode.traceEvents.map((item) => ({
          eventType: item.eventType,
          toolName: item.toolName
        }))
      },
      null,
      2
    )
  );

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
