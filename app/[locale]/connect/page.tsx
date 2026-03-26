import { notFound } from "next/navigation";

import { GraphTheater } from "@/components/graph-theater";
import { Panel } from "@/components/panel";
import { brand } from "@/lib/brand";
import { getConnectSurfaceSummary } from "@/lib/demo-data";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function ConnectPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const connectSurface = await getConnectSurfaceSummary();
  const hostCards = [
    {
      id: "claude",
      name: "Claude Code",
      level: ["MCP", "Setup", "Capture"],
      setup: "npm run claude:setup -- q2-customer-pulse research-agent",
      verify: "npm run claude:verify",
      quickstart: "docs/claude-quickstart.md",
      tone: "agent" as const
    },
    {
      id: "opencode",
      name: "OpenCode",
      level: ["MCP", "Setup", "Import"],
      setup: "npm run opencode:setup",
      verify: "npm run opencode:verify",
      quickstart: "docs/opencode-quickstart.md",
      tone: "artifact" as const
    },
    {
      id: "gemini",
      name: "Gemini CLI",
      level: ["MCP", "Setup"],
      setup: "npm run gemini:setup",
      verify: "npm run gemini:verify",
      quickstart: "docs/gemini-quickstart.md",
      tone: "trace" as const
    }
  ];
  const nodes = [
    {
      id: "traceplane-core",
      label: brand.name,
      meta: locale === "zh" ? "Episode-first control plane" : "Episode-first control plane",
      x: 50,
      y: 18,
      z: 0.96,
      tone: "policy" as const
    },
    {
      id: "claude-host",
      label: "Claude Code",
      meta: locale === "zh" ? "MCP + hooks bridge" : "MCP + hooks bridge",
      x: 18,
      y: 48,
      z: 0.78,
      tone: "agent" as const
    },
    {
      id: "opencode-host",
      label: "OpenCode",
      meta: locale === "zh" ? "MCP + export import" : "MCP + export import",
      x: 78,
      y: 42,
      z: 0.72,
      tone: "artifact" as const
    },
    {
      id: "gemini-host",
      label: "Gemini CLI",
      meta: locale === "zh" ? "MCP + setup verify" : "MCP + setup verify",
      x: 36,
      y: 74,
      z: 0.58,
      tone: "trace" as const
    },
    {
      id: "episode-spine",
      label: locale === "zh" ? "Episode Spine" : "Episode Spine",
      meta: locale === "zh" ? "输入、过程、产物、治理" : "Input, process, outputs, governance",
      x: 64,
      y: 74,
      z: 0.5,
      tone: "audit" as const
    }
  ];
  const edges = [
    { from: "claude-host", to: "traceplane-core", emphasis: "strong" as const },
    { from: "opencode-host", to: "traceplane-core", emphasis: "strong" as const },
    { from: "gemini-host", to: "traceplane-core", emphasis: "soft" as const },
    { from: "traceplane-core", to: "episode-spine", emphasis: "strong" as const }
  ];

  return (
    <div className="space-y-6">
      <GraphTheater
        title={locale === "zh" ? "Connect Traceplane" : "Connect Traceplane"}
        subtitle={
          locale === "zh"
            ? "第一阶段不要替换用户已有 Agent，而是先把 Claude Code、OpenCode、Gemini CLI 的工作证据链接入同一条 Episode 主线。"
            : "Do not replace existing agents in phase one. Connect Claude Code, OpenCode, and Gemini CLI into the same episode spine first."
        }
        nodes={nodes}
        edges={edges}
        stats={[
          { label: locale === "zh" ? "Host 数量" : "Hosts", value: `${connectSurface.hosts.length}` },
          { label: locale === "zh" ? "Episode 总数" : "Episodes", value: `${connectSurface.totals.episodeCount}` },
          { label: locale === "zh" ? "Capture / Import 信号" : "Capture / import signals", value: `${connectSurface.totals.capturedEvents + connectSurface.totals.importedEpisodes}` }
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel
          title={locale === "zh" ? "接入原则" : "Connection Principle"}
          eyebrow="BYO Agent"
        >
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              {locale === "zh"
                ? "Traceplane 当前不要求团队迁移到新的 runtime。第一阶段先让主流 Agent 继续负责执行，再把 episode、memory、trace、artifact 和 audit 沉淀回同一个系统。"
                : "Traceplane does not require teams to migrate to a new runtime in phase one. Let existing agents execute, then return episodes, memory, trace, artifacts, and audit signals into one system."}
            </p>
            <p>
              {locale === "zh"
                ? "判断一条 host 路线是否成熟，不看模型强弱，而看它是否已经具备 MCP、setup、capture 或 import 这些实际可落地的接入层。"
                : "A host path is judged by real integration maturity, not model quality: MCP, setup, capture, and import are what matter."}
            </p>
          </div>
        </Panel>

        <Panel
          title={locale === "zh" ? "Host Runtime Console" : "Host Runtime Console"}
          eyebrow="Signals"
        >
          <div className="space-y-4 text-sm text-slate-300">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] border border-cyan-400/18 bg-cyan-400/8 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">
                  {locale === "zh" ? "部署阶段" : "Deployment stage"}
                </div>
                <div className="mt-2 text-base font-medium text-white">
                  {connectSurface.runtimeSurface.runtime.cloud.deploymentStage}
                </div>
              </div>
              <div className="rounded-[22px] border border-emerald-400/18 bg-emerald-400/8 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">
                  {locale === "zh" ? "对象存储" : "Object storage"}
                </div>
                <div className="mt-2 text-base font-medium text-white">{connectSurface.runtimeSurface.runtime.objectStorage.provider}</div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {locale === "zh" ? "最近 Capture 事件" : "Captured events"}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">{connectSurface.totals.capturedEvents}</div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {locale === "zh" ? "导入 Episode" : "Imported episodes"}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">{connectSurface.totals.importedEpisodes}</div>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-slate-300">
              {locale === "zh"
                ? `同步目录：${connectSurface.runtimeSurface.localProjection.rootPath} · ${connectSurface.runtimeSurface.localProjection.rootExists ? "已检测到本地投影" : "尚未检测到本地投影"}`
                : `Sync root: ${connectSurface.runtimeSurface.localProjection.rootPath} · ${connectSurface.runtimeSurface.localProjection.rootExists ? "projection detected" : "projection not detected"}`}
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-slate-300">
              {connectSurface.runtimeSurface.runtime.cloud.deploymentStage === "cloud-active"
                ? locale === "zh"
                  ? "当前 host 接入已经写入云端工作平面，可把 MCP、capture 和 import 视为正式路径。"
                  : "Current host integrations are writing into the active cloud work plane, so MCP, capture, and import can be treated as production paths."
                : locale === "zh"
                  ? "当前 host 路线已经 ready / prepared，但仍需要云端 cutover 才会变成正式的 work plane ingestion。"
                  : "Host paths are ready / prepared, but a cloud cutover is still required before they become the formal work plane ingestion path."}
            </div>
          </div>
        </Panel>
      </section>

      <Panel title={locale === "zh" ? "Host Setup Matrix" : "Host Setup Matrix"} eyebrow={dict.nav.connect}>
        <div className="grid gap-4 xl:grid-cols-3">
          {hostCards.map((host) => (
            <div
              key={host.id}
              className="rounded-[28px] border border-white/10 bg-white/5 px-5 py-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{host.name}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {host.level.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {locale === "zh" ? "最新信号" : "Latest signal"}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-white">
                    {connectSurface.hosts.find((item) => item.id === host.id)?.latestSignal ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {locale === "zh" ? "Setup" : "Setup"}
                  </div>
                  <pre className="overflow-x-auto rounded-[20px] border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-slate-100">
                    <code>{host.setup}</code>
                  </pre>
                </div>
                <div>
                  <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {locale === "zh" ? "Verify" : "Verify"}
                  </div>
                  <pre className="overflow-x-auto rounded-[20px] border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-slate-100">
                    <code>{host.verify}</code>
                  </pre>
                </div>
                <div className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">
                  {locale === "zh" ? "Quickstart" : "Quickstart"}: {host.quickstart}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
