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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.18),_transparent_32%),linear-gradient(180deg,_#f8f6ef_0%,_#f3efe5_45%,_#eef2f7_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-6 px-4 py-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-[32px] border border-white/50 bg-slate-950/94 p-6 text-slate-50 shadow-[0_20px_70px_rgba(15,23,42,0.25)] lg:block">
          <div className="mb-10">
            <div className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80">Enterprise Agent Work Graph</div>
            <h1 className="mt-3 text-2xl font-semibold">Agent Ops Atlas</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {locale === "zh"
                ? "用同一条 episode 主线组织多 Agent 的上下文、过程、产物与审计。"
                : "Organize multi-agent context, process, artifacts, and audit trails on one episode spine."}
            </p>
          </div>

          <nav className="space-y-2">
            <Link href={`/${locale}/projects`} className="block rounded-2xl bg-white/8 px-4 py-3 text-sm hover:bg-white/12">
              {dict.nav.projects}
            </Link>
            <Link href={`/${locale}/audit`} className="block rounded-2xl bg-white/5 px-4 py-3 text-sm hover:bg-white/10">
              {dict.nav.audit}
            </Link>
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">{dict.common.managerView}</div>
            <p className="mt-2 leading-6">
              {locale === "zh"
                ? "第一版不做复杂图谱画布，先把项目、任务链、产物和审计串起来。"
                : "The first version skips a complex graph canvas and focuses on connecting projects, episodes, artifacts, and audit."}
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 flex items-center justify-between rounded-[28px] border border-white/60 bg-white/70 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{dict.common.workspace}</div>
              <div className="mt-1 font-medium text-slate-950">Northwind Agent Ops</div>
            </div>
            <LanguageSwitch locale={locale} />
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
