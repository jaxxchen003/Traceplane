export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function normalizeLocale(value: string): Locale {
  return isLocale(value) ? value : "zh";
}

type Dictionary = {
  nav: {
    projects: string;
    audit: string;
  };
  common: {
    workspace: string;
    search: string;
    filters: string;
    risk: string;
    noData: string;
    viewAudit: string;
    backToProject: string;
    openArtifact: string;
    language: string;
    timeline: string;
    artifacts: string;
    memories: string;
    summary: string;
    project: string;
    status: string;
    recentArtifacts: string;
    recentEpisodes: string;
    riskSummary: string;
    policyVersion: string;
    participatingAgents: string;
    startedAt: string;
    endedAt: string;
    duration: string;
    actions: string;
    emptyHint: string;
    download: string;
    preview: string;
    versionHistory: string;
    provenance: string;
    reuse: string;
    allProjects: string;
    auditTrail: string;
    latestSignals: string;
    managerView: string;
  };
  projectList: {
    title: string;
    subtitle: string;
    riskProjects: string;
    activeProjects: string;
    recentArtifacts: string;
  };
  projectOverview: {
    agents: string;
    openEpisode: string;
    activePolicy: string;
    noEpisodes: string;
  };
  episode: {
    title: string;
    relationshipMap: string;
    auditSummary: string;
    finalOutcome: string;
    goal: string;
    rawJson: string;
    noTrace: string;
  };
  artifact: {
    title: string;
    sourceEpisode: string;
    generatedBy: string;
    consumedBy: string;
  };
  audit: {
    title: string;
    subtitle: string;
    action: string;
    target: string;
    result: string;
    actor: string;
    permission: string;
    hitReason: string;
    noEvents: string;
  };
  statuses: Record<string, string>;
  traceTypes: Record<string, string>;
};

export const dictionary: Record<Locale, Dictionary> = {
  zh: {
    nav: { projects: "项目", audit: "审计" },
    common: {
      workspace: "工作区",
      search: "搜索",
      filters: "筛选",
      risk: "风险",
      noData: "暂无数据",
      viewAudit: "查看审计",
      backToProject: "返回项目",
      openArtifact: "打开产物",
      language: "语言",
      timeline: "时间线",
      artifacts: "产物",
      memories: "记忆",
      summary: "摘要",
      project: "项目",
      status: "状态",
      recentArtifacts: "最近产物",
      recentEpisodes: "最近任务链",
      riskSummary: "风险摘要",
      policyVersion: "策略版本",
      participatingAgents: "参与 Agent",
      startedAt: "开始时间",
      endedAt: "结束时间",
      duration: "持续时长",
      actions: "操作",
      emptyHint: "先接入一个 Agent 并创建第一条 episode。",
      download: "下载",
      preview: "预览",
      versionHistory: "版本历史",
      provenance: "来源链路",
      reuse: "复用情况",
      allProjects: "全部项目",
      auditTrail: "审计轨迹",
      latestSignals: "最新信号",
      managerView: "管理者视图"
    },
    projectList: {
      title: "项目总览",
      subtitle: "从项目维度查看 Agent 工作主线、产物与风险。",
      riskProjects: "高风险项目",
      activeProjects: "活跃项目",
      recentArtifacts: "最近生成产物"
    },
    projectOverview: {
      agents: "项目 Agent",
      openEpisode: "进入任务复盘",
      activePolicy: "当前生效策略",
      noEpisodes: "这个项目还没有任务主线。"
    },
    episode: {
      title: "任务链复盘",
      relationshipMap: "关系链路",
      auditSummary: "审计摘要",
      finalOutcome: "最终结果",
      goal: "目标",
      rawJson: "查看原始 JSON",
      noTrace: "当前 episode 尚未写入 trace。"
    },
    artifact: {
      title: "产物详情",
      sourceEpisode: "来源任务链",
      generatedBy: "生成 Agent",
      consumedBy: "被复用情况"
    },
    audit: {
      title: "审计视图",
      subtitle: "查看权限拒绝、策略命中和关键读写。",
      action: "动作",
      target: "目标",
      result: "结果",
      actor: "执行者",
      permission: "权限决策",
      hitReason: "命中原因",
      noEvents: "当前筛选条件下没有审计记录。"
    },
    statuses: {
      ACTIVE: "进行中",
      AT_RISK: "有风险",
      PILOT: "试点中",
      RUNNING: "运行中",
      COMPLETED: "已完成",
      FAILED: "失败",
      PENDING_REVIEW: "待审核",
      SUCCESS: "成功",
      WARNING: "警告"
    },
    traceTypes: {
      TASK_STARTED: "任务启动",
      SYNTHESIS: "信息综合",
      HANDOFF: "任务交接",
      ACCESS_CHECK: "访问检查"
    }
  },
  en: {
    nav: { projects: "Projects", audit: "Audit" },
    common: {
      workspace: "Workspace",
      search: "Search",
      filters: "Filters",
      risk: "Risk",
      noData: "No data",
      viewAudit: "View audit",
      backToProject: "Back to project",
      openArtifact: "Open artifact",
      language: "Language",
      timeline: "Timeline",
      artifacts: "Artifacts",
      memories: "Memories",
      summary: "Summary",
      project: "Project",
      status: "Status",
      recentArtifacts: "Recent artifacts",
      recentEpisodes: "Recent episodes",
      riskSummary: "Risk summary",
      policyVersion: "Policy version",
      participatingAgents: "Participating agents",
      startedAt: "Started at",
      endedAt: "Ended at",
      duration: "Duration",
      actions: "Actions",
      emptyHint: "Connect an agent and create the first episode.",
      download: "Download",
      preview: "Preview",
      versionHistory: "Version history",
      provenance: "Provenance",
      reuse: "Reuse",
      allProjects: "All projects",
      auditTrail: "Audit trail",
      latestSignals: "Latest signals",
      managerView: "Manager view"
    },
    projectList: {
      title: "Project Overview",
      subtitle: "Inspect agent work lines, artifacts, and risk signals at the project level.",
      riskProjects: "Projects at risk",
      activeProjects: "Active projects",
      recentArtifacts: "Recently generated artifacts"
    },
    projectOverview: {
      agents: "Project agents",
      openEpisode: "Open episode review",
      activePolicy: "Active policy",
      noEpisodes: "This project has no episodes yet."
    },
    episode: {
      title: "Episode Review",
      relationshipMap: "Relationship map",
      auditSummary: "Audit summary",
      finalOutcome: "Final outcome",
      goal: "Goal",
      rawJson: "View raw JSON",
      noTrace: "No trace events have been written for this episode."
    },
    artifact: {
      title: "Artifact Detail",
      sourceEpisode: "Source episode",
      generatedBy: "Generated by",
      consumedBy: "Reuse"
    },
    audit: {
      title: "Audit View",
      subtitle: "Inspect denials, policy hits, and sensitive read/write events.",
      action: "Action",
      target: "Target",
      result: "Result",
      actor: "Actor",
      permission: "Permission",
      hitReason: "Hit reason",
      noEvents: "No audit events match the current filter."
    },
    statuses: {
      ACTIVE: "Active",
      AT_RISK: "At risk",
      PILOT: "Pilot",
      RUNNING: "Running",
      COMPLETED: "Completed",
      FAILED: "Failed",
      PENDING_REVIEW: "Pending review",
      SUCCESS: "Success",
      WARNING: "Warning"
    },
    traceTypes: {
      TASK_STARTED: "Task started",
      SYNTHESIS: "Synthesis",
      HANDOFF: "Handoff",
      ACCESS_CHECK: "Access check"
    }
  }
};

export function getDictionary(locale: Locale) {
  return dictionary[locale];
}
