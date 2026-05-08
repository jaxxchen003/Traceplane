-- Symphony Phase 2 Task Graph support.

CREATE TYPE "TaskGraphStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "TaskGraphEpisodeRole" AS ENUM ('ORCHESTRATOR', 'WORKER');

ALTER TABLE "Episode" ADD COLUMN IF NOT EXISTS "forkPointTraceId" TEXT;
ALTER TABLE "TraceEvent" ADD COLUMN IF NOT EXISTS "snapshot" JSONB;

CREATE TABLE "task_graphs" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "symphonyTaskId" TEXT NOT NULL,
  "orchestratorEpisodeId" TEXT NOT NULL,
  "status" "TaskGraphStatus" NOT NULL DEFAULT 'RUNNING',
  "sensitivity" TEXT NOT NULL DEFAULT 'Internal',
  "policyVersion" TEXT NOT NULL,
  "createdByAgentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "task_graphs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "task_graph_episodes" (
  "id" TEXT NOT NULL,
  "taskGraphId" TEXT NOT NULL,
  "episodeId" TEXT NOT NULL,
  "role" "TaskGraphEpisodeRole" NOT NULL,
  "agentId" TEXT NOT NULL,
  "assignedSubtask" TEXT NOT NULL,
  "dependencyEpisodeIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "task_graph_episodes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "task_graphs_symphonyTaskId_key" ON "task_graphs"("symphonyTaskId");
CREATE INDEX "task_graphs_workspaceId_idx" ON "task_graphs"("workspaceId");
CREATE INDEX "task_graphs_projectId_status_idx" ON "task_graphs"("projectId", "status");
CREATE INDEX "task_graphs_orchestratorEpisodeId_idx" ON "task_graphs"("orchestratorEpisodeId");
CREATE INDEX "task_graphs_createdByAgentId_idx" ON "task_graphs"("createdByAgentId");

CREATE UNIQUE INDEX "task_graph_episodes_taskGraphId_episodeId_key" ON "task_graph_episodes"("taskGraphId", "episodeId");
CREATE INDEX "task_graph_episodes_episodeId_idx" ON "task_graph_episodes"("episodeId");
CREATE INDEX "task_graph_episodes_agentId_idx" ON "task_graph_episodes"("agentId");

ALTER TABLE "task_graphs"
  ADD CONSTRAINT "task_graphs_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_graphs"
  ADD CONSTRAINT "task_graphs_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_graphs"
  ADD CONSTRAINT "task_graphs_orchestratorEpisodeId_fkey"
  FOREIGN KEY ("orchestratorEpisodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_graphs"
  ADD CONSTRAINT "task_graphs_createdByAgentId_fkey"
  FOREIGN KEY ("createdByAgentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_graph_episodes"
  ADD CONSTRAINT "task_graph_episodes_taskGraphId_fkey"
  FOREIGN KEY ("taskGraphId") REFERENCES "task_graphs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_graph_episodes"
  ADD CONSTRAINT "task_graph_episodes_episodeId_fkey"
  FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "task_graph_episodes"
  ADD CONSTRAINT "task_graph_episodes_agentId_fkey"
  FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
