"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitch({ locale }: { locale: "zh" | "en" }) {
  const pathname = usePathname();
  const altLocale = locale === "zh" ? "en" : "zh";
  const nextPath = pathname.replace(/^\/(zh|en)/, `/${altLocale}`);

  return (
    <Link
      href={nextPath || `/${altLocale}/projects`}
      className="rounded border border-void-700 bg-void-800 px-3 py-1.5 text-sm text-ink transition hover:border-accent hover:bg-accent-dim hover:text-accent-glow"
    >
      {locale === "zh" ? "EN" : "中文"}
    </Link>
  );
}
