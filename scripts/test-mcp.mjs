import { PrismaClient } from "@prisma/client";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  const episode = await prisma.episode.findFirst({ orderBy: { createdAt: "asc" } });

  if (!project || !episode) {
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

  const context = await client.callTool({
    name: "query_context",
    arguments: {
      project_id: project.id,
      goal: "基于研究结果生成摘要",
      work_type: "GENERATE",
      limit: 2
    }
  });

  const brief = await client.callTool({
    name: "get_episode_brief",
    arguments: {
      episode_id: episode.id,
      locale: "zh"
    }
  });

  console.log(
    JSON.stringify(
      {
        toolNames,
        contextOk: Boolean(context.structuredContent?.project_context),
        briefOk: Boolean(brief.structuredContent?.episode_id)
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
