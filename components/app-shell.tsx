import Link from "next/link";
import type { ReactNode } from "react";

import { brand } from "@/lib/brand";
import { LanguageSwitch } from "@/components/language-switch";
import { getDictionary, type Locale } from "@/lib/i18n";

export function AppShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dict = getDictionary(locale);

  return (
    <div className="relative min-h-screen overflow-hidden bg-void-950">
      <div className="pointer-events-none absolute inset-0 bg-dot" />
      
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded border border-void-600 bg-void-900 p-6 text-ink lg:block">
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 rounded border border-accent/20 bg-accent-dim px-3 py-1.5 text-[10px] uppercase tracking-wider text-accent">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-accent text-[9px] font-semibold text-white">
                T
              </span>
              <span>{brand.category}</span>
            </div>
            <h1 className="mt-4 text-[32px] font-semibold tracking-tight text-ink">
              {brand.name}
            </h1>
            <div className="mt-2 text-sm uppercase tracking-wider text-ink-faint">
              {locale === "zh" ? brand.descriptorZh : brand.descriptorEn}
            </div>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              {locale === "zh" ? brand.shortPitchZh : brand.shortPitchEn}
            </p>
          </div>

          <nav className="space-y-1">
            <Link
              href={`/${locale}`}
              className="block rounded border border-signal-success/20 bg-signal-success/5 px-4 py-2.5 text-sm text-signal-success transition hover:border-signal-success/30 hover:bg-signal-success/10"
            >
              {dict.nav.dashboard}
            </Link>
            <Link
              href={`/${locale}/projects`}
              className="block rounded border border-accent/20 bg-accent-dim px-4 py-2.5 text-sm text-accent transition hover:border-accent/30 hover:bg-accent/15"
            >
              {dict.nav.projects}
            </Link>
            <Link
              href={`/${locale}/connect`}
              className="block rounded border border-signal-warning/20 bg-signal-warning/5 px-4 py-2.5 text-sm text-signal-warning transition hover:border-signal-warning/30 hover:bg-signal-warning/10"
            >
              {dict.nav.connect}
            </Link>
            <Link
              href={`/${locale}/audit`}
              className="block rounded border border-void-500 bg-void-800 px-4 py-2.5 text-sm text-ink-muted transition hover:border-void-400 hover:bg-void-700 hover:text-ink"
            >
              {dict.nav.audit}
            </Link>
          </nav>

          <div className="mt-10 rounded border border-void-600 bg-void-800 p-5 text-sm text-ink-muted">
            <div className="text-[11px] uppercase tracking-wider text-signal-warning">
              {dict.common.managerView}
            </div>
            <p className="mt-3 leading-7">
              {locale === "zh"
                ? "主画面不是聊天窗口，而是一个能同时观察 agent、episode、artifact 与 policy 命中的指挥界面。"
                : "The primary surface is not a chat window but a command surface for agents, episodes, artifacts, and policy signals."}
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded border border-void-600 bg-void-800 px-4 py-4">
              <div className="text-[11px] uppercase tracking-wider text-ink-faint">
                Agent First
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">
                {locale === "zh"
                  ? "上下文、过程、产物、风险在同一块舞台里被看到。"
                  : "Context, process, outputs, and risk should be visible on one stage."}
              </div>
            </div>
            <div className="rounded border border-void-600 bg-void-800 px-4 py-4">
              <div className="text-[11px] uppercase tracking-wider text-ink-faint">
                Control Layer
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">
                {locale === "zh"
                  ? "管理者不是读日志，而是在结构化界面里做判断。"
                  : "Managers should judge from a structured surface, not raw logs."}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 flex flex-col gap-4 rounded border border-void-600 bg-void-900 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-faint">
                  {dict.common.workspace}
                </div>
                <div className="mt-1 text-base font-medium text-ink">
                  {brand.tenantDemoName}
                </div>
              </div>
              <div className="hidden h-8 w-px bg-void-600 xl:block" />
              <div className="flex flex-wrap gap-2">
                <div className="rounded border border-accent/20 bg-accent-dim px-3 py-1 text-xs uppercase tracking-wider text-accent">
                  {brand.name}
                </div>
                <div className="rounded border border-signal-success/20 bg-signal-success/5 px-3 py-1 text-xs uppercase tracking-wider text-signal-success">
                  Episode-first
                </div>
                <div className="rounded border border-signal-warning/20 bg-signal-warning/5 px-3 py-1 text-xs uppercase tracking-wider text-signal-warning">
                  Control plane
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
