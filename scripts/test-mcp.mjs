import { PrismaClient } from "@prisma/client";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  const episode = await prisma.episode.findFirst({ orderBy: { createdAt: "asc" } });
  const agent = await prisma.agent.findFirst({ orderBy: { createdAt: "asc" } });

  if (!project || !episode || !agent) {
    throw new Error("Seed data not found");
  }

  const client = new Client({
    name: "enterprise-agent-work-graph-test-client",
    version: "1.0.0"
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["scripts/mcp-server.mjs"],
    cwd: process.cwd(),
    stderr: "pipe"
  });

  await client.connect(transport);

  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name).sort();

  const createdEpisode = await client.callTool({
    name: "create_episode",
    arguments: {
      project_id: project.id,
      primary_agent_id: agent.id,
      title: {
        zh: "MCP 自测 Episode",
        en: "MCP Smoke Test Episode"
      },
      goal: {
        zh: "验证 MCP 写入链路是否完整可用",
        en: "Validate the MCP write path end to end"
      },
      work_type: "GENERATE",
      success_criteria: {
        zh: "完成 memory、trace、artifact 写入，并返回 episode brief",
        en: "Write memory, trace, and artifact, then return an episode brief"
      }
    }
  });

  const createdEpisodeId = createdEpisode.structuredContent?.episode_id;

  if (!createdEpisodeId) {
    throw new Error("create_episode did not return episode_id");
  }

  const context = await client.callTool({
    name: "query_context",
    arguments: {
      project_id: project.id,
      goal: "基于研究结果生成摘要",
      work_type: "GENERATE",
      limit: 2
    }
  });

  const memory = await client.callTool({
    name: "write_memory",
    arguments: {
      episode_id: createdEpisodeId,
      title: "MCP 自测背景",
      content: "这是由 MCP 自测脚本写入的上下文记忆。",
      memory_type: "SEMANTIC",
      agent_id: agent.id
    }
  });

  const trace = await client.callTool({
    name: "append_trace",
    arguments: {
      episode_id: createdEpisodeId,
      event_type: "task_started",
      summary: "MCP 自测开始执行",
      actor_agent_id: agent.id,
      tool_name: "mcp-test",
      related_memory_ids: memory.structuredContent?.memory_id ? [memory.structuredContent.memory_id] : []
    }
  });

  const artifact = await client.callTool({
    name: "create_artifact",
    arguments: {
      episode_id: createdEpisodeId,
      created_by_agent_id: agent.id,
      title: "MCP 自测产物",
      artifact_type: "MARKDOWN",
      content: "# MCP Smoke Test\n\nThis artifact was created through the MCP server.",
      source_trace_id: trace.structuredContent?.trace_event_id
    }
  });

  await client.callTool({
    name: "update_episode_status",
    arguments: {
      episode_id: createdEpisodeId,
      status: "IN_REVIEW",
      review_outcome: "PENDING",
      actor_id: agent.id
    }
  });

  const brief = await client.callTool({
    name: "get_episode_brief",
    arguments: {
      episode_id: createdEpisodeId,
      locale: "zh"
    }
  });

  const linkedEpisode = await client.callTool({
    name: "link_episode",
    arguments: {
      from_episode_id: createdEpisodeId,
      to_episode_id: episode.id,
      relation_type: "REFERENCES",
      actor_id: agent.id
    }
  });

  console.log(
    JSON.stringify(
      {
        toolNames,
        createdEpisodeId,
        contextOk: Boolean(context.structuredContent?.project_context),
        memoryOk: Boolean(memory.structuredContent?.memory_id),
        traceOk: Boolean(trace.structuredContent?.trace_event_id),
        artifactOk: Boolean(artifact.structuredContent?.artifact_id),
        briefOk: Boolean(brief.structuredContent?.episode_id)
        ,
        linkOk: Boolean(linkedEpisode.structuredContent?.edge_id)
      },
      null,
      2
    )
  );

  await transport.close();
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
