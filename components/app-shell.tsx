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
      <nav className="sticky top-0 z-50 h-12 border-b border-void-700 bg-void-950/90 backdrop-blur-md flex items-center px-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded-[5px] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span className="font-semibold text-sm text-ink">{brand.name}</span>
        </div>
        <div className="w-px h-5 bg-void-700" />
        <div className="hidden md:flex items-center gap-0">
          <Link href={`/${locale}`} className="px-3 h-12 flex items-center text-sm text-ink-faint hover:text-ink border-b-2 border-transparent transition-colors">
            {dict.nav.dashboard}
          </Link>
          <Link href={`/${locale}/projects`} className="px-3 h-12 flex items-center text-sm text-ink border-b-2 border-accent transition-colors">
            {dict.nav.projects}
          </Link>
          <Link href={`/${locale}/connect`} className="px-3 h-12 flex items-center text-sm text-ink-faint hover:text-ink border-b-2 border-transparent transition-colors">
            {dict.nav.connect}
          </Link>
          <Link href={`/${locale}/audit`} className="px-3 h-12 flex items-center text-sm text-ink-faint hover:text-ink border-b-2 border-transparent transition-colors">
            {dict.nav.audit}
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitch locale={locale} />
          <div className="w-7 h-7 bg-void-800 rounded-full flex items-center justify-center text-[10px] text-ink-faint border border-void-700">JC</div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
