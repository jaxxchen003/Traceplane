import Link from "next/link";
import type { ReactNode } from "react";

import { LanguageSwitch } from "@/components/language-switch";
import { getDictionary, type Locale } from "@/lib/i18n";

export function AppShell({
  locale,
  children
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dict = getDictionary(locale);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="pointer-events-none absolute left-[-12%] top-[-10%] h-[440px] w-[440px] rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-[12%] h-[420px] w-[420px] rounded-full bg-fuchsia-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-80 shrink-0 rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,32,0.95),rgba(2,6,23,0.98))] p-6 text-slate-50 shadow-[0_24px_90px_rgba(2,6,23,0.45)] lg:block">
          <div className="mb-10">
            <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.34em] text-cyan-100">
              Enterprise Agent Work Graph
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Agent Ops Atlas</h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {locale === "zh"
                ? "以 work graph 为主舞台，把 agent 的上下文、决策、产物与治理信号集中呈现。"
                : "Use a work graph as the primary stage for context, decisions, artifacts, and governance signals."}
            </p>
          </div>

          <nav className="space-y-3">
            <Link
              href={`/${locale}/projects`}
              className="block rounded-[22px] border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50 transition hover:border-cyan-300/40 hover:bg-cyan-400/14"
            >
              {dict.nav.projects}
            </Link>
            <Link
              href={`/${locale}/audit`}
              className="block rounded-[22px] border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200 transition hover:border-white/14 hover:bg-white/8"
            >
              {dict.nav.audit}
            </Link>
          </nav>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <div className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-200/80">
              {dict.common.managerView}
            </div>
            <p className="mt-3 leading-7">
              {locale === "zh"
                ? "主画面不是聊天窗口，而是一个能同时观察 agent、episode、artifact 与 policy 命中的指挥界面。"
                : "The primary surface is not a chat window but a command surface for agents, episodes, artifacts, and policy signals."}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Agent First
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-200">
                {locale === "zh"
                  ? "上下文、过程、产物、风险在同一块舞台里被看到。"
                  : "Context, process, outputs, and risk should be visible on one stage."}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/4 px-4 py-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Control Layer
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-200">
                {locale === "zh"
                  ? "管理者不是读日志，而是在结构化界面里做判断。"
                  : "Managers should judge from a structured surface, not raw logs."}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 flex flex-col gap-4 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.88))] px-5 py-4 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500">
                  {dict.common.workspace}
                </div>
                <div className="mt-1 text-base font-medium text-white">Northwind Agent Ops</div>
              </div>
              <div className="hidden h-8 w-px bg-white/10 xl:block" />
              <div className="flex flex-wrap gap-2">
                <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
                  4 live agents
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-100">
                  9 active episodes
                </div>
                <div className="rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fuchsia-100">
                  3 policy alerts
                </div>
              </div>
            </div>
            <LanguageSwitch locale={locale} />
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
