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
    dashboard: string;
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
  dashboard: {
    title: string;
    subtitle: string;
    needsAttention: string;
    blockedRisk: string;
    activeWork: string;
    recentActivity: string;
    openEpisode: string;
    openProject: string;
    noItems: string;
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
  controls: {
    createEpisode: string;
    continueEpisode: string;
    addMemory: string;
    addTrace: string;
    addArtifact: string;
    titleZh: string;
    titleEn: string;
    summaryZh: string;
    summaryEn: string;
    goalZh: string;
    goalEn: string;
    successCriteriaZh: string;
    successCriteriaEn: string;
    contentZh: string;
    contentEn: string;
    primaryAgent: string;
    actorAgent: string;
    type: string;
    workType: string;
    source: string;
    importance: string;
    sensitivity: string;
    toolName: string;
    eventType: string;
    shortResultZh: string;
    shortResultEn: string;
    decisionZh: string;
    decisionEn: string;
    resultZh: string;
    resultEn: string;
    artifactKey: string;
    fileType: string;
    shareScope: string;
    linkedMemoryIds: string;
    sourceTraceEvent: string;
    submit: string;
    creating: string;
    created: string;
    refreshHint: string;
  };
  statuses: Record<string, string>;
  traceTypes: Record<string, string>;
};

export const dictionary: Record<Locale, Dictionary> = {
  zh: {
    nav: { dashboard: "总览", projects: "项目", audit: "审计" },
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
    dashboard: {
      title: "Episode Command Center",
      subtitle: "先看需要处理的工作，再看异常、活跃执行与最近变化。首页不是任务列表，而是注意力分发系统。",
      needsAttention: "待处理",
      blockedRisk: "异常与阻塞",
      activeWork: "活跃工作",
      recentActivity: "最近活动",
      openEpisode: "打开 Episode",
      openProject: "查看项目",
      noItems: "当前没有需要关注的 Episode。"
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
    controls: {
      createEpisode: "创建新任务链",
      continueEpisode: "继续写入当前任务链",
      addMemory: "新增记忆",
      addTrace: "追加 Trace",
      addArtifact: "生成 Artifact",
      titleZh: "中文标题",
      titleEn: "英文标题",
      summaryZh: "中文摘要",
      summaryEn: "英文摘要",
      goalZh: "中文目标",
      goalEn: "英文目标",
      successCriteriaZh: "中文完成标准",
      successCriteriaEn: "英文完成标准",
      contentZh: "中文内容",
      contentEn: "英文内容",
      primaryAgent: "主 Agent",
      actorAgent: "执行 Agent",
      type: "类型",
      workType: "工作类型",
      source: "来源",
      importance: "重要度",
      sensitivity: "敏感级别",
      toolName: "工具名",
      eventType: "事件类型",
      shortResultZh: "中文短结果",
      shortResultEn: "英文短结果",
      decisionZh: "中文决策",
      decisionEn: "英文决策",
      resultZh: "中文结果",
      resultEn: "英文结果",
      artifactKey: "Artifact Key",
      fileType: "文件类型",
      shareScope: "共享范围",
      linkedMemoryIds: "关联 Memory",
      sourceTraceEvent: "来源 Trace",
      submit: "提交",
      creating: "提交中...",
      created: "已创建",
      refreshHint: "提交成功后页面会自动刷新。"
    },
    statuses: {
      ACTIVE: "进行中",
      AT_RISK: "有风险",
      PILOT: "试点中",
      PLANNED: "已规划",
      IN_PROGRESS: "进行中",
      BLOCKED: "已阻塞",
      IN_REVIEW: "审核中",
      COMPLETED: "已完成",
      FAILED: "失败",
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
    nav: { dashboard: "Overview", projects: "Projects", audit: "Audit" },
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
    dashboard: {
      title: "Episode Command Center",
      subtitle:
        "Look at what needs attention first, then blocked work, active execution, and recent movement. The home surface is an attention router, not a task dump.",
      needsAttention: "Needs Attention",
      blockedRisk: "Blocked & Risk",
      activeWork: "Active Work",
      recentActivity: "Recent Activity",
      openEpisode: "Open episode",
      openProject: "Open project",
      noItems: "There are no episodes in this section right now."
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
    controls: {
      createEpisode: "Create episode",
      continueEpisode: "Continue episode",
      addMemory: "Add memory",
      addTrace: "Append trace",
      addArtifact: "Create artifact",
      titleZh: "Chinese title",
      titleEn: "English title",
      summaryZh: "Chinese summary",
      summaryEn: "English summary",
      goalZh: "Chinese goal",
      goalEn: "English goal",
      successCriteriaZh: "Chinese success criteria",
      successCriteriaEn: "English success criteria",
      contentZh: "Chinese content",
      contentEn: "English content",
      primaryAgent: "Primary agent",
      actorAgent: "Actor agent",
      type: "Type",
      workType: "Work type",
      source: "Source",
      importance: "Importance",
      sensitivity: "Sensitivity",
      toolName: "Tool name",
      eventType: "Event type",
      shortResultZh: "Chinese short result",
      shortResultEn: "English short result",
      decisionZh: "Chinese decision",
      decisionEn: "English decision",
      resultZh: "Chinese result",
      resultEn: "English result",
      artifactKey: "Artifact key",
      fileType: "File type",
      shareScope: "Share scope",
      linkedMemoryIds: "Linked memories",
      sourceTraceEvent: "Source trace",
      submit: "Submit",
      creating: "Submitting...",
      created: "Created",
      refreshHint: "The page refreshes automatically after a successful write."
    },
    statuses: {
      ACTIVE: "Active",
      AT_RISK: "At risk",
      PILOT: "Pilot",
      PLANNED: "Planned",
      IN_PROGRESS: "In progress",
      BLOCKED: "Blocked",
      IN_REVIEW: "In review",
      COMPLETED: "Completed",
      FAILED: "Failed",
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
