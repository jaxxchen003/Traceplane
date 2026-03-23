import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const zhEn = (zh, en) => ({ zh, en });

async function main() {
  await prisma.nodeEdge.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.accessGrant.deleteMany();
  await prisma.artifact.deleteMany();
  await prisma.traceEvent.deleteMany();
  await prisma.memoryItem.deleteMany();
  await prisma.episodeAgent.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.projectAgent.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: {
      name: "Northwind Agent Ops",
      slug: "northwind-agent-ops",
      ownerId: "manager-lin"
    }
  });

  const researchAgent = await prisma.agent.create({
    data: {
      slug: "research-agent",
      name: "Research Agent",
      roleI18n: zhEn("研究分析 Agent", "Research Analysis Agent"),
      ownerName: "Growth Team",
      capabilities: ["search", "synthesis", "competitive-analysis"],
      lastActiveAt: new Date("2026-03-23T06:20:00.000Z")
    }
  });

  const writerAgent = await prisma.agent.create({
    data: {
      slug: "writer-agent",
      name: "Writer Agent",
      roleI18n: zhEn("汇报撰写 Agent", "Reporting Agent"),
      ownerName: "Operations Team",
      capabilities: ["markdown", "reporting", "handoff"],
      lastActiveAt: new Date("2026-03-23T06:27:00.000Z")
    }
  });

  const complianceAgent = await prisma.agent.create({
    data: {
      slug: "compliance-agent",
      name: "Compliance Agent",
      roleI18n: zhEn("合规审查 Agent", "Compliance Agent"),
      ownerName: "Security Team",
      capabilities: ["policy-check", "approval", "audit"],
      lastActiveAt: new Date("2026-03-22T11:10:00.000Z")
    }
  });

  const customerProject = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      slug: "q2-customer-pulse",
      nameI18n: zhEn("Q2 客户脉搏项目", "Q2 Customer Pulse"),
      descriptionI18n: zhEn(
        "围绕客户反馈、竞争动态和周报输出的多 Agent 协作项目。",
        "A multi-agent project for customer feedback synthesis, competitive tracking, and weekly reporting."
      ),
      status: "ACTIVE",
      ownerName: "Lin",
      activePolicyVersion: "policy.project.customer.v0.4"
    }
  });

  const complianceProject = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      slug: "compliance-pilot",
      nameI18n: zhEn("合规审查试点", "Compliance Pilot"),
      descriptionI18n: zhEn(
        "用于验证敏感文档审批和访问审计的试点项目。",
        "A pilot project for sensitive-document approval and access auditing."
      ),
      status: "AT_RISK",
      ownerName: "Maya",
      activePolicyVersion: "policy.project.compliance.v0.2"
    }
  });

  await prisma.projectAgent.createMany({
    data: [
      { projectId: customerProject.id, agentId: researchAgent.id },
      { projectId: customerProject.id, agentId: writerAgent.id },
      { projectId: complianceProject.id, agentId: complianceAgent.id }
    ]
  });

  await prisma.policy.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId: customerProject.id,
        name: "Customer reporting policy",
        version: "policy.project.customer.v0.4",
        rulesJson: {
          mustCiteSources: true,
          approvalForExternalShare: true,
          redactPII: true
        }
      },
      {
        workspaceId: workspace.id,
        projectId: complianceProject.id,
        name: "Compliance pilot policy",
        version: "policy.project.compliance.v0.2",
        rulesJson: {
          manualApprovalRequired: true,
          restrictedDataNoShare: true
        }
      }
    ]
  });

  const pulseEpisode = await prisma.episode.create({
    data: {
      projectId: customerProject.id,
      primaryAgentId: researchAgent.id,
      titleI18n: zhEn("客户反馈归因与周报生成", "Customer Feedback Attribution and Weekly Report"),
      summaryI18n: zhEn(
        "研究 Agent 汇总客户反馈并生成研究简报，Writer Agent 在同一条主线上生成管理周报。",
        "The research agent synthesized customer signals into a research brief, then the writer agent turned it into a manager-facing weekly report."
      ),
      goalI18n: zhEn("在同一条任务主线上完成研究结论和管理周报交付。", "Produce a research brief and manager report on the same work graph."),
      finalOutcomeI18n: zhEn("已生成研究简报与管理周报，且全链路可回放。", "A research brief and manager report were generated with full traceability."),
      status: "COMPLETED",
      policyVersion: "policy.project.customer.v0.4",
      startedAt: new Date("2026-03-23T05:50:00.000Z"),
      endedAt: new Date("2026-03-23T06:28:00.000Z")
    }
  });

  const complianceEpisode = await prisma.episode.create({
    data: {
      projectId: complianceProject.id,
      primaryAgentId: complianceAgent.id,
      titleI18n: zhEn("敏感文档访问审批检查", "Sensitive Document Approval Check"),
      summaryI18n: zhEn("合规 Agent 尝试访问受限资料时触发了审批等待和权限拒绝。", "The compliance agent triggered an approval hold and a permission denial while attempting to read restricted files."),
      goalI18n: zhEn("验证高风险读操作是否保留完整证据链。", "Verify that high-risk reads leave a complete evidence trail."),
      finalOutcomeI18n: zhEn("任务暂停，等待人工审批。", "Task paused pending manual approval."),
      status: "PENDING_REVIEW",
      policyVersion: "policy.project.compliance.v0.2",
      startedAt: new Date("2026-03-22T10:40:00.000Z"),
      endedAt: null
    }
  });

  await prisma.episodeAgent.createMany({
    data: [
      { episodeId: pulseEpisode.id, agentId: researchAgent.id },
      { episodeId: pulseEpisode.id, agentId: writerAgent.id },
      { episodeId: complianceEpisode.id, agentId: complianceAgent.id }
    ]
  });

  const memoryBackground = await prisma.memoryItem.create({
    data: {
      episodeId: pulseEpisode.id,
      agentId: researchAgent.id,
      titleI18n: zhEn("项目背景与范围", "Project Background and Scope"),
      contentI18n: zhEn(
        "目标是整合本周客户反馈、竞争动态与产品风险，生成管理周报。",
        "The goal is to combine customer feedback, competitor moves, and product risks into a manager-ready weekly report."
      ),
      type: "SEMANTIC",
      source: "manager_brief",
      importance: 9,
      sensitivity: "Confidential",
      ttlDays: 30
    }
  });

  const memoryInterviews = await prisma.memoryItem.create({
    data: {
      episodeId: pulseEpisode.id,
      agentId: researchAgent.id,
      titleI18n: zhEn("客户访谈摘要", "Customer Interview Summary"),
      contentI18n: zhEn(
        "访谈显示用户主要担心价格透明度和自定义工作流能力不足。",
        "Interviews show customer concern around pricing transparency and weak custom workflow controls."
      ),
      type: "EPISODIC",
      source: "distilled",
      importance: 8,
      sensitivity: "Internal",
      ttlDays: 14
    }
  });

  const memoryStyle = await prisma.memoryItem.create({
    data: {
      episodeId: pulseEpisode.id,
      agentId: writerAgent.id,
      titleI18n: zhEn("管理周报写作规范", "Manager Report Style Guide"),
      contentI18n: zhEn(
        "输出需结构化、引用来源、避免未经验证的强结论。",
        "The output must be structured, source-backed, and avoid unverified conclusions."
      ),
      type: "PROCEDURAL",
      source: "policy_distillation",
      importance: 7,
      sensitivity: "Internal",
      ttlDays: 60
    }
  });

  const traceKickoff = await prisma.traceEvent.create({
    data: {
      episodeId: pulseEpisode.id,
      actorAgentId: researchAgent.id,
      stepIndex: 1,
      eventType: "TASK_STARTED",
      toolName: "context-router",
      stepTitleI18n: zhEn("读取项目背景并建立研究范围", "Read project brief and define research scope"),
      status: "SUCCESS",
      shortResultI18n: zhEn("已装载背景和任务边界。", "Loaded project background and task boundaries."),
      inputSummaryI18n: zhEn("输入了项目背景、上周总结和角色要求。", "Ingested project brief, last week's recap, and role constraints."),
      decisionSummaryI18n: zhEn("优先抽取客户反馈与竞品变化。", "Prioritized customer feedback and competitor movement."),
      resultSummaryI18n: zhEn("进入研究阶段。", "Moved into research phase."),
      eventTime: new Date("2026-03-23T05:53:00.000Z")
    }
  });

  const traceResearch = await prisma.traceEvent.create({
    data: {
      episodeId: pulseEpisode.id,
      actorAgentId: researchAgent.id,
      stepIndex: 2,
      eventType: "SYNTHESIS",
      toolName: "memory-distiller",
      stepTitleI18n: zhEn("汇总访谈与竞品变化", "Synthesize interviews and competitor movement"),
      status: "SUCCESS",
      shortResultI18n: zhEn("形成 3 条研究结论。", "Produced three research conclusions."),
      inputSummaryI18n: zhEn("读取访谈摘要和 CRM 反馈片段。", "Read interview summaries and CRM excerpts."),
      decisionSummaryI18n: zhEn("将价格透明度与流程可定制性定义为主问题。", "Framed pricing transparency and workflow control as the top themes."),
      resultSummaryI18n: zhEn("生成研究简报候选稿。", "Generated a candidate research brief."),
      policyHitReasonI18n: zhEn("外部引用必须保留来源。", "External references must preserve citations."),
      eventTime: new Date("2026-03-23T06:05:00.000Z")
    }
  });

  const traceWriter = await prisma.traceEvent.create({
    data: {
      episodeId: pulseEpisode.id,
      actorAgentId: writerAgent.id,
      stepIndex: 3,
      eventType: "HANDOFF",
      toolName: "report-composer",
      stepTitleI18n: zhEn("消费研究简报并生成管理周报", "Consume the research brief and compose the manager report"),
      status: "SUCCESS",
      shortResultI18n: zhEn("周报已完成一稿。", "The manager report draft is complete."),
      inputSummaryI18n: zhEn("读取研究简报、写作规范和项目上下文。", "Read the research brief, style guide, and project context."),
      decisionSummaryI18n: zhEn("先给结论，再给证据，再给建议动作。", "Structured the report as conclusions, evidence, and recommended next actions."),
      resultSummaryI18n: zhEn("产出可给管理者直接阅读的 Markdown 周报。", "Produced a manager-ready Markdown weekly report."),
      eventTime: new Date("2026-03-23T06:20:00.000Z")
    }
  });

  const traceCompliance = await prisma.traceEvent.create({
    data: {
      episodeId: complianceEpisode.id,
      actorAgentId: complianceAgent.id,
      stepIndex: 1,
      eventType: "ACCESS_CHECK",
      toolName: "policy-gate",
      stepTitleI18n: zhEn("尝试访问敏感法务资料", "Attempt to access restricted legal files"),
      status: "FAILED",
      shortResultI18n: zhEn("访问被拒绝，进入审批等待。", "Access denied and moved into approval hold."),
      inputSummaryI18n: zhEn("请求读取法务合同原文。", "Requested full legal contract text."),
      resultSummaryI18n: zhEn("系统返回权限拒绝。", "The system returned a permission denial."),
      errorSummaryI18n: zhEn("当前 agent 未获批访问 Restricted 级文档。", "The current agent is not approved to access Restricted documents."),
      permissionDeniedI18n: zhEn("缺少 Restricted 文档读取授权。", "Missing authorization for Restricted-document reads."),
      eventTime: new Date("2026-03-22T10:46:00.000Z")
    }
  });

  const researchBrief = await prisma.artifact.create({
    data: {
      episodeId: pulseEpisode.id,
      createdByAgentId: researchAgent.id,
      sourceTraceEventId: traceResearch.id,
      artifactKey: "customer-research-brief",
      titleI18n: zhEn("客户研究简报", "Customer Research Brief"),
      contentI18n: zhEn(
        "# 客户研究简报\n\n- 主题一：价格透明度\n- 主题二：工作流可定制性\n- 主题三：竞争产品正在强化协作审计能力",
        "# Customer Research Brief\n\n- Theme 1: Pricing transparency\n- Theme 2: Workflow configurability\n- Theme 3: Competitors are strengthening collaboration audit features"
      ),
      fileType: "MARKDOWN",
      version: 1,
      uri: "/demo-artifacts/customer-research-brief.md",
      sensitivity: "Internal",
      shareScope: "project"
    }
  });

  const weeklyReport = await prisma.artifact.create({
    data: {
      episodeId: pulseEpisode.id,
      createdByAgentId: writerAgent.id,
      sourceTraceEventId: traceWriter.id,
      artifactKey: "manager-weekly-report",
      titleI18n: zhEn("管理周报", "Manager Weekly Report"),
      contentI18n: zhEn(
        "# 管理周报\n\n## 本周结论\n客户流失风险主要来自价格透明度与工作流灵活性。\n\n## 建议动作\n1. 调整定价解释页\n2. 补上工作流模板能力",
        "# Manager Weekly Report\n\n## Weekly Findings\nRetention risk is driven by pricing clarity and workflow flexibility.\n\n## Recommended Actions\n1. Improve pricing explanation pages\n2. Add workflow template support"
      ),
      fileType: "MARKDOWN",
      version: 1,
      uri: "/demo-artifacts/manager-weekly-report.md",
      sensitivity: "Confidential",
      shareScope: "project"
    }
  });

  const complianceSnapshot = await prisma.artifact.create({
    data: {
      episodeId: complianceEpisode.id,
      createdByAgentId: complianceAgent.id,
      sourceTraceEventId: traceCompliance.id,
      artifactKey: "approval-snapshot",
      titleI18n: zhEn("审批状态快照", "Approval Status Snapshot"),
      contentI18n: zhEn(
        "{\n  \"status\": \"pending_review\",\n  \"reason\": \"restricted_document_access\"\n}",
        "{\n  \"status\": \"pending_review\",\n  \"reason\": \"restricted_document_access\"\n}"
      ),
      fileType: "JSON",
      version: 1,
      uri: "/demo-artifacts/approval-snapshot.json",
      sensitivity: "Restricted",
      shareScope: "workspace"
    }
  });

  await prisma.accessGrant.createMany({
    data: [
      {
        projectId: customerProject.id,
        subjectType: "agent",
        subjectId: researchAgent.id,
        scopeType: "project",
        effect: "allow"
      },
      {
        projectId: customerProject.id,
        subjectType: "agent",
        subjectId: writerAgent.id,
        scopeType: "project",
        effect: "allow"
      },
      {
        projectId: complianceProject.id,
        subjectType: "agent",
        subjectId: complianceAgent.id,
        scopeType: "episode",
        effect: "conditional"
      }
    ]
  });

  await prisma.nodeEdge.createMany({
    data: [
      { fromNodeType: "memory", fromNodeId: memoryBackground.id, toNodeType: "trace", toNodeId: traceKickoff.id, edgeType: "USED_IN" },
      { fromNodeType: "memory", fromNodeId: memoryInterviews.id, toNodeType: "trace", toNodeId: traceResearch.id, edgeType: "USED_IN" },
      { fromNodeType: "memory", fromNodeId: memoryStyle.id, toNodeType: "trace", toNodeId: traceWriter.id, edgeType: "USED_IN" },
      { fromNodeType: "memory", fromNodeId: memoryInterviews.id, toNodeType: "artifact", toNodeId: researchBrief.id, edgeType: "GENERATED_FROM" },
      { fromNodeType: "trace", fromNodeId: traceResearch.id, toNodeType: "artifact", toNodeId: researchBrief.id, edgeType: "GENERATED_FROM" },
      { fromNodeType: "artifact", fromNodeId: researchBrief.id, toNodeType: "trace", toNodeId: traceWriter.id, edgeType: "USED_IN" },
      { fromNodeType: "trace", fromNodeId: traceWriter.id, toNodeType: "artifact", toNodeId: weeklyReport.id, edgeType: "GENERATED_FROM" },
      { fromNodeType: "artifact", fromNodeId: weeklyReport.id, toNodeType: "agent", toNodeId: writerAgent.id, edgeType: "SHARED_WITH" },
      { fromNodeType: "artifact", fromNodeId: researchBrief.id, toNodeType: "agent", toNodeId: writerAgent.id, edgeType: "SHARED_WITH" },
      { fromNodeType: "trace", fromNodeId: traceCompliance.id, toNodeType: "artifact", toNodeId: complianceSnapshot.id, edgeType: "GENERATED_FROM" }
    ]
  });

  await prisma.auditEvent.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId: customerProject.id,
        episodeId: pulseEpisode.id,
        memoryItemId: memoryBackground.id,
        occurredAt: new Date("2026-03-23T05:53:20.000Z"),
        actorType: "agent",
        actorId: researchAgent.id,
        action: "read_memory",
        targetType: "memory",
        targetId: memoryBackground.id,
        result: "success",
        permissionDecision: "allow"
      },
      {
        workspaceId: workspace.id,
        projectId: customerProject.id,
        episodeId: pulseEpisode.id,
        traceEventId: traceResearch.id,
        occurredAt: new Date("2026-03-23T06:05:40.000Z"),
        actorType: "agent",
        actorId: researchAgent.id,
        action: "append_trace",
        targetType: "trace",
        targetId: traceResearch.id,
        result: "success",
        policyVersion: "policy.project.customer.v0.4",
        policyHitReasonI18n: zhEn("命中引用保留规则。", "Citation retention rule applied."),
        permissionDecision: "allow"
      },
      {
        workspaceId: workspace.id,
        projectId: customerProject.id,
        episodeId: pulseEpisode.id,
        artifactId: weeklyReport.id,
        occurredAt: new Date("2026-03-23T06:21:10.000Z"),
        actorType: "agent",
        actorId: writerAgent.id,
        action: "create_artifact",
        targetType: "artifact",
        targetId: weeklyReport.id,
        result: "success",
        policyVersion: "policy.project.customer.v0.4",
        permissionDecision: "allow"
      },
      {
        workspaceId: workspace.id,
        projectId: complianceProject.id,
        episodeId: complianceEpisode.id,
        traceEventId: traceCompliance.id,
        artifactId: complianceSnapshot.id,
        occurredAt: new Date("2026-03-22T10:46:30.000Z"),
        actorType: "agent",
        actorId: complianceAgent.id,
        action: "read_restricted_document",
        targetType: "document",
        targetId: "legal-master-contract",
        result: "denied",
        policyVersion: "policy.project.compliance.v0.2",
        permissionDecision: "deny",
        denyReasonI18n: zhEn("Restricted 级资料需要人工审批。", "Restricted materials require human approval.")
      }
    ]
  });

  console.log("Seeded MVP demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
