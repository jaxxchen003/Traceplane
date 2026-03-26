import Link from "next/link";
import { notFound } from "next/navigation";

import { GraphTheater } from "@/components/graph-theater";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { brand } from "@/lib/brand";
import { formatDate } from "@/lib/format";
import { getEpisodeCommandCenter, getRuntimeSurfaceSummary, getWorkspaceSummary } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

function HostTile({
  name,
  status,
  labels,
  note
}: {
  name: string;
  status: string;
  labels: string[];
  note: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-white">{name}</div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
          {status}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span
            key={label}
            className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{note}</p>
    </div>
  );
}

function RuntimeSignal({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "warn"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : "border-white/10 bg-white/6 text-slate-100";

  return (
    <div className={`rounded-[20px] border px-4 py-4 ${toneClass}`}>
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}

function EpisodeList({
  locale,
  title,
  eyebrow,
  items,
  emptyLabel,
  ctaLabel,
  projectLabel
}: {
  locale: "zh" | "en";
  title: string;
  eyebrow: string;
  items: Array<{
    id: string;
    title: string;
    goal: string;
    summary: string;
    status: string;
    projectId: string;
    projectName: string;
    primaryActor: string;
    updatedAt: Date;
    permissionDeniedCount: number;
    policyHitCount: number;
    artifactCount: number;
  }>;
  emptyLabel: string;
  ctaLabel: string;
  projectLabel: string;
}) {
  const dict = getDictionary(locale);

  return (
    <Panel title={title} eyebrow={eyebrow}>
      {items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 px-5 py-8 text-sm text-slate-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <StatusBadge label={dict.statuses[item.status]} raw={item.status} />
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{item.goal || item.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <span>{item.primaryActor}</span>
                    <span>{projectLabel}: {item.projectName}</span>
                    <span>{item.artifactCount} artifacts</span>
                  </div>
                </div>
                <div className="min-w-[220px] space-y-3 text-sm text-slate-300">
                  <div>{formatDate(item.updatedAt, locale)}</div>
                  <div className="flex flex-wrap gap-2">
                    {item.permissionDeniedCount > 0 ? (
                      <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                        {item.permissionDeniedCount} denials
                      </span>
                    ) : null}
                    {item.policyHitCount > 0 ? (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                        {item.policyHitCount} policy hits
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link
                      href={`/${locale}/projects/${item.projectId}/episodes/${item.id}`}
                      className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-100"
                    >
                      {ctaLabel}
                    </Link>
                    <Link
                      href={`/${locale}/projects/${item.projectId}`}
                      className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium text-slate-200"
                    >
                      {dict.dashboard.openProject}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

export default async function LocaleHome({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const [workspace, commandCenter, runtimeSurface] = await Promise.all([
    getWorkspaceSummary(),
    getEpisodeCommandCenter(locale),
    getRuntimeSurfaceSummary()
  ]);

  const hostCards = [
    {
      name: "Claude Code",
      status: "Capture",
      labels: ["MCP", "Setup", "Hooks"],
      note:
        locale === "zh"
          ? "当前最完整的接入路径，已具备 hook capture 和 episode 写入。"
          : "The most complete host path today, with hook capture and episode writes."
    },
    {
      name: "OpenCode",
      status: "Import+MCP",
      labels: ["MCP", "Setup", "Import"],
      note:
        locale === "zh"
          ? "支持 export 标准化导入，也可以作为 MCP host 使用。"
          : "Supports normalized export import and can also act as an MCP host."
    },
    {
      name: "Gemini CLI",
      status: "Setup",
      labels: ["MCP", "Verify"],
      note:
        locale === "zh"
          ? "接入和校验路径已就绪，后续补 telemetry 和 checkpoint ingestion。"
          : "Setup and verification are ready; telemetry and checkpoint ingestion come next."
    }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title={locale === "zh" ? "Work Plane Status" : "Work Plane Status"} eyebrow="Runtime">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <RuntimeSignal
              label={locale === "zh" ? "部署阶段" : "Deployment stage"}
              value={runtimeSurface.runtime.cloud.deploymentStage}
              tone={runtimeSurface.runtime.cloud.deploymentStage === "cloud-active" ? "good" : "warn"}
            />
            <RuntimeSignal
              label={locale === "zh" ? "数据库" : "Database"}
              value={`${runtimeSurface.runtime.database.provider} · ${runtimeSurface.runtime.database.source} · ${runtimeSurface.runtime.database.connectionMode}`}
              tone={runtimeSurface.runtime.database.provider === "postgres" ? "good" : "warn"}
            />
            <RuntimeSignal
              label={locale === "zh" ? "对象存储" : "Object storage"}
              value={`${runtimeSurface.runtime.objectStorage.provider} · ${runtimeSurface.counts.r2ArtifactCount}/${runtimeSurface.counts.artifactCount}`}
              tone={runtimeSurface.runtime.objectStorage.provider === "r2" ? "good" : "warn"}
            />
            <RuntimeSignal
              label={locale === "zh" ? "待审核 Episode" : "Episodes in review"}
              value={`${runtimeSurface.counts.inReviewCount}`}
              tone={runtimeSurface.counts.inReviewCount > 0 ? "warn" : "neutral"}
            />
            <RuntimeSignal
              label={locale === "zh" ? "失败 Episode" : "Failed episodes"}
              value={`${runtimeSurface.counts.failedCount}`}
              tone={runtimeSurface.counts.failedCount > 0 ? "warn" : "neutral"}
            />
            <RuntimeSignal
              label={locale === "zh" ? "同步根目录" : "Sync root"}
              value={runtimeSurface.localProjection.rootPath}
              tone={runtimeSurface.localProjection.rootExists ? "good" : "neutral"}
            />
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.58),rgba(2,6,23,0.88))] px-5 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-amber-400/24 bg-amber-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100">
                {locale === "zh" ? "产品形态" : "Product posture"}
              </div>
              <div className="rounded-full border border-cyan-400/24 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                {locale === "zh" ? "云端为主" : "Cloud first"}
              </div>
              <div className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100">
                {locale === "zh" ? "本地投影" : "Local projection"}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {locale === "zh"
                ? "正式产品的权威状态在云端工作平面中，本地目录只是同步投影和 agent 友好的 working copy。这样一个 Agent 做完后，下一个 Agent 才能沿着同一条 spine 接着做。"
                : "The source of truth lives in the cloud work plane. Local files are projections and agent-friendly working copies so the next agent can continue along the same spine."}
            </p>

            <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
              <span className="font-medium text-white">
                {locale === "zh" ? "当前判定：" : "Current verdict:"}
              </span>{" "}
              {runtimeSurface.runtime.cloud.deploymentStage === "cloud-active"
                ? locale === "zh"
                  ? "云端工作平面已经生效，Episode、brief、artifact 和本地投影都可以围绕同一条远端主线工作。"
                  : "The cloud work plane is active. Episodes, briefs, artifacts, and local projections are all anchored to one remote spine."
                : runtimeSurface.runtime.cloud.deploymentStage === "cloud-configured"
                  ? locale === "zh"
                    ? "云端凭证已经配置，但当前还没完全切到统一远端主线。"
                    : "Cloud credentials are configured, but the app has not fully cut over to one remote spine yet."
                  : locale === "zh"
                    ? "当前仍是 demo-local，工作主线还在本地，跨 Agent continuity 只能部分成立。"
                    : "The app is still running in demo-local mode, so cross-agent continuity only works partially."}
            </div>

            {runtimeSurface.runtime.cloud.readiness.blockers.length > 0 ? (
              <div className="mt-4 rounded-[20px] border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm text-amber-50">
                <div className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80">
                  {locale === "zh" ? "云端阻塞项" : "Cloud blockers"}
                </div>
                <ul className="mt-3 space-y-2">
                  {runtimeSurface.runtime.cloud.readiness.blockers.slice(0, 3).map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {runtimeSurface.runtime.cloud.activationBlockers.length > 0 ? (
              <div className="mt-4 rounded-[20px] border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-50">
                <div className="text-[11px] uppercase tracking-[0.18em] text-rose-200/80">
                  {locale === "zh" ? "云端激活阻塞" : "Cloud activation blockers"}
                </div>
                <ul className="mt-3 space-y-2">
                  {runtimeSurface.runtime.cloud.activationBlockers.slice(0, 3).map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title={locale === "zh" ? "Connected Hosts" : "Connected Hosts"} eyebrow="Integration">
            <div className="grid gap-4">
              {hostCards.map((host) => (
                <HostTile key={host.name} {...host} />
              ))}
            </div>
          </Panel>

          <Panel title={locale === "zh" ? "Local Projection" : "Local Projection"} eyebrow="~/Traceplane">
            <div className="space-y-4 text-sm leading-7 text-slate-300">
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {locale === "zh" ? "目录状态" : "Directory status"}
                </div>
                <div className="mt-2 text-base font-medium text-white">
                  {runtimeSurface.localProjection.rootExists
                    ? locale === "zh"
                      ? "已检测到本地投影目录"
                      : "Projection root detected"
                    : locale === "zh"
                      ? "尚未检测到本地投影目录"
                      : "Projection root not detected"}
                </div>
                <div className="mt-2 text-sm text-slate-400">{runtimeSurface.localProjection.rootPath}</div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {locale === "zh" ? "本地工作区" : "Projected workspaces"}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {runtimeSurface.localProjection.projectedWorkspaceCount}
                  </div>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {locale === "zh" ? "R2 覆盖产物" : "R2-backed artifacts"}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {runtimeSurface.counts.r2ArtifactCount}/{runtimeSurface.counts.artifactCount}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <GraphTheater
        title={dict.dashboard.title}
        subtitle={dict.dashboard.subtitle}
        nodes={commandCenter.graphNodes}
        edges={commandCenter.graphEdges}
        stats={[
          { label: dict.dashboard.needsAttention, value: `${commandCenter.stats.needsAttention}` },
          { label: dict.dashboard.blockedRisk, value: `${commandCenter.stats.blockedRisk}` },
          { label: dict.dashboard.activeWork, value: `${commandCenter.stats.activeWork}` }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title={workspace?.name ?? brand.tenantDemoName} eyebrow="Attention Model">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[24px] border border-cyan-400/16 bg-cyan-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">
                {dict.dashboard.needsAttention}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{commandCenter.stats.needsAttention}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {locale === "zh"
                  ? "优先展示需要你确认、处理或决策的工作。"
                  : "Work that requires your decision or intervention comes first."}
              </div>
            </div>
            <div className="rounded-[24px] border border-rose-400/16 bg-rose-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-rose-200/80">
                {dict.dashboard.blockedRisk}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{commandCenter.stats.blockedRisk}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {locale === "zh"
                  ? "把阻塞、失败、权限拒绝和策略命中集中拉出来。"
                  : "Blocked work, failures, denials, and policy hits are grouped together."}
              </div>
            </div>
            <div className="rounded-[24px] border border-emerald-400/16 bg-emerald-400/8 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">
                {dict.dashboard.activeWork}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">{commandCenter.stats.activeWork}</div>
              <div className="mt-2 text-sm leading-6 text-slate-300">
                {locale === "zh"
                  ? "顺利推进的工作次级展示，不盖过待处理与异常。"
                  : "Healthy execution is visible, but never outranks attention and risk."}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={locale === "zh" ? "Home Principle" : "Home Principle"} eyebrow="Episode First">
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              {locale === "zh"
                ? "这个首页不再把 Project 放在主舞台，而是先把可以继续、交接和处理的 Episode 放到最前。Project 仍然存在，但它退到归属和汇总视角。"
                : "This home surface no longer puts projects at center stage. It promotes the episodes that can be continued, handed off, and acted on, while projects remain the summary layer."}
            </p>
            <p>
              {locale === "zh"
                ? "排序原则是：待处理 > 异常/阻塞 > 活跃工作 > 最近活动。第一层卖点不是治理，而是 continuity。"
                : "The ranking principle is: needs attention > blocked and risk > active work > recent activity. The first-layer value is continuity, not governance."}
            </p>
          </div>
        </Panel>
      </section>

      <Panel
        title={locale === "zh" ? "First Continuity Loop" : "First Continuity Loop"}
        eyebrow="Connect -> Work -> Brief -> Continue"
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {[
            {
              step: "01",
              title: locale === "zh" ? "接入一个 Agent" : "Connect one agent",
              body:
                locale === "zh"
                  ? "先从 Claude Code、OpenCode 或 Gemini CLI 开始，不要求迁移现有工作方式。"
                  : "Start with Claude Code, OpenCode, or Gemini CLI without changing how you already work."
            },
            {
              step: "02",
              title: locale === "zh" ? "自动沉淀 Episode" : "Auto-capture an episode",
              body:
                locale === "zh"
                  ? "目标、关键步骤、产物和状态自动沉淀成同一条工作主线。"
                  : "Goals, key steps, artifacts, and status are captured into one work spine."
            },
            {
              step: "03",
              title: locale === "zh" ? "生成交接 brief" : "Generate a handoff brief",
              body:
                locale === "zh"
                  ? "系统告诉下一位 Agent：做到哪一步、最新产物是什么、下一步该做什么。"
                  : "The system tells the next agent where the work stopped, what the latest artifact is, and what to do next."
            },
            {
              step: "04",
              title: locale === "zh" ? "继续而不是重来" : "Continue instead of restarting",
              body:
                locale === "zh"
                  ? "换一个 Agent 继续工作，不再重新解释背景，也不再从零开始。"
                  : "Switch to another agent and continue the work without re-explaining the context or starting from scratch."
            }
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-5 py-5"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">{item.step}</div>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </Panel>

      <EpisodeList
        locale={locale}
        title={dict.dashboard.needsAttention}
        eyebrow="Needs Attention"
        items={commandCenter.needsAttention}
        emptyLabel={dict.dashboard.noItems}
        ctaLabel={dict.dashboard.openEpisode}
        projectLabel={dict.common.project}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <EpisodeList
          locale={locale}
          title={dict.dashboard.blockedRisk}
          eyebrow="Blocked / Risk"
          items={commandCenter.blockedRisk}
          emptyLabel={dict.dashboard.noItems}
          ctaLabel={dict.dashboard.openEpisode}
          projectLabel={dict.common.project}
        />
        <EpisodeList
          locale={locale}
          title={dict.dashboard.activeWork}
          eyebrow="Live Work"
          items={commandCenter.activeWork}
          emptyLabel={dict.dashboard.noItems}
          ctaLabel={dict.dashboard.openEpisode}
          projectLabel={dict.common.project}
        />
      </div>

      <EpisodeList
        locale={locale}
        title={dict.dashboard.recentActivity}
        eyebrow="Recent"
        items={commandCenter.recentActivity}
        emptyLabel={dict.dashboard.noItems}
        ctaLabel={dict.dashboard.openEpisode}
        projectLabel={dict.common.project}
      />
    </div>
  );
}
