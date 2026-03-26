import Link from "next/link";
import { notFound } from "next/navigation";

import { GraphTheater } from "@/components/graph-theater";
import { Panel } from "@/components/panel";
import { StatusBadge } from "@/components/status-badge";
import { brand } from "@/lib/brand";
import { formatDate } from "@/lib/format";
import { getEpisodeCommandCenter, getWorkspaceSummary } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

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
  const [workspace, commandCenter] = await Promise.all([
    getWorkspaceSummary(),
    getEpisodeCommandCenter(locale)
  ]);

  return (
    <div className="space-y-6">
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
                ? "这个首页不再把 Project 放在主舞台，而是先把需要处理的 Episode 放到最前。Project 仍然存在，但它退到价值归属和汇总视角。"
                : "This home surface no longer puts projects at center stage. It promotes the episodes that need action, while projects remain the layer for value attribution and summary."}
            </p>
            <p>
              {locale === "zh"
                ? "排序原则是：待处理 > 异常/阻塞 > 活跃工作 > 最近活动。"
                : "The ranking principle is: needs attention > blocked and risk > active work > recent activity."}
            </p>
          </div>
        </Panel>
      </section>

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
