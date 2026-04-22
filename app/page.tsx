import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Traceplane · Multi-Agent Continuity Layer",
  description: "让多个 Agent 的工作接成一条不断档、可回看、可交接的工作主线。",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-void-950 text-white">
      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-3K6BSYFM2V" />
      <script dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3K6BSYFM2V');
        `
      }} />

      <header className="sticky top-0 z-50 border-b border-void-800 bg-void-950/90 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-semibold">Traceplane</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/zh/projects" className="text-ink-faint hover:text-white transition-colors">
              平台演示
            </Link>
            <a href="https://github.com/jaxxchen003/Traceplane" className="text-ink-faint hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://traceplane.cc" className="rounded-full border border-void-700 bg-white/5 px-4 py-1.5 text-xs hover:border-accent/50 transition-colors">
              文档
            </a>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Multi-Agent Continuity Layer
            </div>
            <h1 className="mb-6 text-5xl font-bold leading-tight">
              Agent 工作不再断档
            </h1>
            <p className="mb-8 text-xl text-ink-muted leading-relaxed">
              让 Claude Code、OpenCode、Gemini CLI 的工作接成一条不断档、可回看、可交接的主线。
              <br />
              一个 Episode 记录完整上下文，下一个 Agent 直接继续。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/zh/projects"
                className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-void-950 hover:bg-white/90 transition-colors"
              >
                查看平台演示 →
              </Link>
              <a
                href="https://github.com/jaxxchen003/Traceplane"
                className="rounded-lg border border-void-700 px-6 py-3 text-sm font-medium hover:border-void-500 transition-colors"
              >
                开源代码
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-void-800">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-semibold">核心能力</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Episode 连续性模型"
              description="不仅是记录，而是 Agent 的意识载体。每个 Episode 都是完整的执行上下文，可随时恢复、复用和交接。"
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              }
              title="无损交接"
              description="自动生成 Handoff Brief：目标、关键步骤、最新产物和注意事项压缩成一份文档，交给下一个 Agent 直接继续。"
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
              title="全链路可观测"
              description="Agent 行为、Artifact 沉淀、风险指标在同一视图被看到。每个事件可回链到来源 Trace，形成完整证据链。"
            />
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-void-800">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-semibold">工作流程</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <StepCard
              number="01"
              title="创建 Episode"
              description="在 Claude Code 中描述任务目标，系统自动创建 Episode 并开始追踪。"
            />
            <StepCard
              number="02"
              title="执行与记录"
              description="关键步骤自动写入 Trace，重要决策记录为 Memory，形成可回看的证据链。"
            />
            <StepCard
              number="03"
              title="生成产物"
              description="最终结果注册为 Artifact，包含来源链路和生成上下文，随时可追溯。"
            />
            <StepCard
              number="04"
              title="交接继续"
              description="下一个 Agent 通过 Handoff Brief 直接继续，不重复解释上下文，工作不间断。"
            />
          </div>
        </div>
      </section>

      <section className="py-32 border-t border-void-800">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-semibold">开始使用</h2>
          <p className="mb-8 text-ink-muted">
            本地运行 Traceplane，为你的 Agent 工作流添加连续性层。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/zh/projects"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              查看演示 →
            </Link>
            <a
              href="https://github.com/jaxxchen003/Traceplane"
              className="rounded-lg border border-void-700 px-6 py-3 text-sm font-medium hover:border-void-500 transition-colors"
            >
              阅读文档
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-void-800 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="font-semibold">Traceplane</span>
            </div>
            <p className="text-sm text-ink-muted">
              MIT License · 开源免费
            </p>
            <div className="flex gap-4 text-sm text-ink-muted">
              <a href="https://github.com/jaxxchen003/Traceplane" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://traceplane.cc" className="hover:text-white transition-colors">官网</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-void-800 bg-white/3 p-6">
      <div className="mb-4 text-accent">{icon}</div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative rounded-2xl border border-void-800 bg-white/3 p-6">
      <div className="mb-4 text-4xl font-bold text-accent/30">{number}</div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="text-sm text-ink-muted">{description}</p>
    </div>
  );
}